using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;
using Microsoft.AspNetCore.Authorization;
using BACKEND.Models;
using Google.Apis.Auth;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;


[Route("api/auth")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly TopcvBeContext _context;
    private readonly IConfiguration _config;
    private readonly IMemoryCache _memoryCache;
    private readonly EmailService _emailService;

    public AuthController(TopcvBeContext context, IConfiguration config, IMemoryCache memoryCache, EmailService emailService)
    {
        _context = context;
        _config = config;
        _memoryCache = memoryCache;
        _emailService = emailService;
    }
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == request.Username);
        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.Password))
            return BadRequest(new { message = "Sai tên đăng nhập hoặc mật khẩu." });

        var role = await _context.UserRoles
            .Where(r => r.Id == user.RoleId)
            .Select(r => r.Name)
            .FirstOrDefaultAsync() ?? "user";

        var claims = new List<Claim>
    {
        new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
        new Claim(ClaimTypes.Role, role)
    };

        var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
        var authProperties = new AuthenticationProperties
        {
            IsPersistent = true,
            ExpiresUtc = DateTimeOffset.UtcNow.AddHours(1)
        };

        await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, new ClaimsPrincipal(claimsIdentity), authProperties);

        return Ok(new
        {
            message = "Đăng nhập thành công",
            user = new
            {
                user.Id,
                user.Username,
                Role = role
            }
        });
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        return Ok(new { message = "Đăng xuất thành công!" });
    }
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);
        var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (existingUser != null)
        {
            return BadRequest(new { message = "Email đã tồn tại." });
        }
        var roleExists = await _context.UserRoles
        .AnyAsync(r => r.Id == request.RoleId);
        if (!roleExists)
        {
            request.RoleId = 2;
        }

        string hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password);

        var newUser = new User
        {
            Username = request.Name ?? "Người dùng mới",
            Email = request.Email ?? "",
            Password = hashedPassword,
            RoleId = request.RoleId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(newUser);
        await _context.SaveChangesAsync();

        // Nếu là employer hoặc candidate thì tạo profile
        if (request.RoleId == 1)  // employer
        {
            var companyName = !string.IsNullOrWhiteSpace(request.CompanyName)
                                    ? request.CompanyName
                                    : "Chưa cập nhật";

            _context.CompanyProfiles.Add(new CompanyProfile
            {
                UserId = newUser.Id,
                CompanyName = companyName,
                Slug = GenerateSlug(companyName)
            });
        }

        else if (request.RoleId == 3)
        {
            _context.CandidateProfiles.Add(new CandidateProfile
            {
                UserId = newUser.Id,
                Fullname = !string.IsNullOrWhiteSpace(request.FullName)
                        ? request.FullName
                        : request.Name
            });
        }

        await _context.SaveChangesAsync();

        string role = await _context.UserRoles
            .Where(r => r.Id == newUser.RoleId)
            .Select(r => r.Name)
            .FirstOrDefaultAsync() ?? "user";

        // Đăng nhập tự động sau đăng ký
        var claims = new List<Claim>
    {
        new Claim(ClaimTypes.NameIdentifier, newUser.Id.ToString()),
        new Claim(ClaimTypes.Role, role)
    };

        var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
        var authProperties = new AuthenticationProperties
        {
            IsPersistent = true,
            ExpiresUtc = DateTimeOffset.UtcNow.AddHours(100)
        };

        await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, new ClaimsPrincipal(claimsIdentity), authProperties);

        return Ok(new
        {
            message = "Đăng ký thành công",
            user = new
            {
                newUser.Id,
                newUser.Username,
                newUser.Email,
                newUser.Avatar,
                Role = role
            }
        });
    }

    private string GenerateJwtToken(User user, string role)
    {
        var jwtSettings = _config.GetSection("JwtSettings");

        var secret = jwtSettings["Secret"] ?? throw new ArgumentNullException("JwtSettings:Secret is missing");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var expireMinutes = jwtSettings["ExpireMinutes"];
        if (!int.TryParse(expireMinutes, out int expireTime))
        {
            expireTime = 60;
        }

        var claims = new[]
        {
        new Claim(JwtRegisteredClaimNames.Sub, user.Username),
        new Claim("id", user.Id.ToString()),
        new Claim("role", role)
    };


        var token = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expireTime),
            signingCredentials: creds
        );


        return new JwtSecurityTokenHandler().WriteToken(token);
    }
    [HttpPut("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == request.UserName);

        if (user == null)
        {
            return NotFound(new { message = "Người dùng không tồn tại!" });
        }

        if (!BCrypt.Net.BCrypt.Verify(request.OldPassword, user.Password))
        {
            return BadRequest(new { message = "Mật khẩu cũ không chính xác!" });
        }
        user.Password = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Đổi mật khẩu thành công!" });
    }
    [Authorize(Roles = "admin")]
    [HttpGet("users")]
    public async Task<IActionResult> GetAllUsers([FromQuery] int page = 1, [FromQuery] int pageSize = 5, [FromQuery] string? search = null)
    {
        var baseUrl = $"{Request.Scheme}://{Request.Host}/";

        var query = _context.Users.AsQueryable();
        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(u => u.Username.Contains(search) || u.Email.Contains(search));
        }

        var totalUsers = await query.CountAsync();

        var users = await query
            .OrderBy(u => u.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(u => new
            {
                Id = u.Id,
                Username = u.Username,
                Email = u.Email,
                Role = _context.UserRoles.Where(r => r.Id == u.RoleId).Select(r => r.Name).FirstOrDefault(),
                Avatar = string.IsNullOrEmpty(u.Avatar)
                    ? null
                    : (u.Avatar.StartsWith("https") ? u.Avatar : baseUrl + "uploads/avatars/" + u.Avatar),
                u.CreatedAt,
            })
            .ToListAsync();

        return Ok(new
        {
            TotalUsers = totalUsers,
            Page = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling(totalUsers / (double)pageSize),
            Users = users
        });
    }

    [Authorize(Roles = "admin")]
    [HttpGet("user-stats")]
    public async Task<IActionResult> GetUserStats()
    {
        var totalUsers = await _context.Users.CountAsync();
        var now = DateTime.UtcNow;
        var firstDayOfMonth = new DateTime(now.Year, now.Month, 1);
        var newUsersThisMonth = await _context.Users.CountAsync(u => u.CreatedAt >= firstDayOfMonth);
        var roleStats = await _context.Users
            .GroupBy(u => u.RoleId)
            .Select(g => new
            {
                RoleId = g.Key,
                RoleName = _context.UserRoles.Where(r => r.Id == g.Key).Select(r => r.Name).FirstOrDefault(),
                Count = g.Count()
            })
            .ToListAsync();

        return Ok(new
        {
            TotalUsers = totalUsers,
            NewUsersThisMonth = newUsersThisMonth,
            RoleStats = roleStats
        });
    }

    [Authorize(Roles = "admin")]
    [HttpDelete("delete/{id}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
        {
            return NotFound(new { message = "Người dùng không tồn tại!" });
        }

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private string GenerateSlug(string text)
    {
        return text?
            .Trim()
            .ToLowerInvariant()
            .Replace(" ", "-")
            .Replace(".", "")
            .Replace(",", "")
            ?? "";
    }

    [HttpPost("google-login")]
    public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginRequest request)
    {
        // 1. Validate token giống trước
        var settings = new GoogleJsonWebSignature.ValidationSettings
        {
            Audience = new List<string?> { _config["GoogleAuth:ClientId"] }
        };
        GoogleJsonWebSignature.Payload payload;
        try
        {
            payload = await GoogleJsonWebSignature.ValidateAsync(request.Token, settings);
        }
        catch
        {
            return BadRequest(new { message = "Token không hợp lệ!" });
        }

        // 2. Tìm user
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == payload.Email);

        // 3. Nếu chưa có user
        if (user == null)
        {
            // 3a. Chưa chọn role → yêu cầu client gửi lại kèm role + info
            if (!request.RoleId.HasValue)
            {
                return Ok(new
                {
                    requireRoleSelection = true,
                    email = payload.Email,
                    name = payload.Name,
                    avatar = payload.Picture
                });
            }

            // 3b. Tạo mới User
            var newUser = new User
            {
                Username = payload.Name ?? "User",
                Email = payload.Email,
                Avatar = payload.Picture,
                RoleId = request.RoleId.Value,
                CreatedAt = DateTime.UtcNow
            };
            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            // 3c. Tạo profile + slug nếu cần
            if (request.RoleId.Value == 1)  // employer
            {
                var companyName = !string.IsNullOrWhiteSpace(request.CompanyName)
                                      ? request.CompanyName
                                      : payload.Name ?? "Chưa cập nhật";

                _context.CompanyProfiles.Add(new CompanyProfile
                {
                    UserId = newUser.Id,
                    CompanyName = companyName,
                    Slug = GenerateSlug(companyName)
                });
            }
            else if (request.RoleId.Value == 3)  // candidate
            {
                var fullName = !string.IsNullOrWhiteSpace(request.FullName)
                                      ? request.FullName
                                      : payload.Name ?? "Chưa cập nhật";

                _context.CandidateProfiles.Add(new CandidateProfile
                {
                    UserId = newUser.Id,
                    Fullname = fullName
                });
            }

            await _context.SaveChangesAsync();
            user = newUser;
        }

        // 4. Sign-in như bình thường
        var roleName = await _context.UserRoles
                              .Where(r => r.Id == user.RoleId)
                              .Select(r => r.Name)
                              .FirstOrDefaultAsync() ?? "user";

        var claims = new List<Claim> {
        new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
        new Claim(ClaimTypes.Role, roleName)
    };
        var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
        var principal = new ClaimsPrincipal(identity);
        var props = new AuthenticationProperties
        {
            IsPersistent = true,
            ExpiresUtc = DateTimeOffset.UtcNow.AddHours(100)
        };
        await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, principal, props);

        return Ok(new
        {
            message = "Đăng nhập Google thành công",
            user = new
            {
                user.Id,
                user.Username,
                user.Email,
                user.Avatar,
                Role = roleName
            }
        });
    }
    [HttpPost("forgot-password")]
    public IActionResult ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        if (string.IsNullOrEmpty(request.Email))
            return BadRequest(new { message = "Email không được để trống" });

        var user = _context.Users.FirstOrDefault(u => u.Email == request.Email);
        if (user == null)
            return BadRequest(new { message = "Email không tồn tại trong hệ thống." });

        string otp = new Random().Next(100000, 999999).ToString();
        _memoryCache.Set(request.Email, otp, TimeSpan.FromMinutes(5));

        _emailService.SendEmail(request.Email, "Mã OTP đặt lại mật khẩu", $"Mã OTP của bạn là: {otp}. Mã này có hiệu lực trong 5 phút.");

        return Ok(new { message = "OTP đã được gửi đến email của bạn." });
    }


    [HttpPost("reset-password")]
    public IActionResult ResetPassword([FromBody] ResetPasswordRequest request)
    {
        if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.NewPassword) || string.IsNullOrEmpty(request.OTP))
            return BadRequest(new { message = "Email, OTP và mật khẩu mới không được để trống." });

        if (!_memoryCache.TryGetValue(request.Email, out string? storedOtp) || storedOtp != request.OTP)
        {
            return BadRequest(new { message = "OTP không hợp lệ hoặc đã hết hạn." });
        }

        var user = _context.Users.FirstOrDefault(u => u.Email == request.Email);
        if (user == null)
            return BadRequest(new { message = "Email không tồn tại." });

        user.Password = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        _context.SaveChanges();
        _memoryCache.Remove(request.Email);

        return Ok(new { message = "Mật khẩu đã được đặt lại thành công." });
    }
}





