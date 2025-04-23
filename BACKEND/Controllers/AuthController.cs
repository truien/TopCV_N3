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
            ExpiresUtc = DateTimeOffset.UtcNow.AddHours(100)
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
    var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
    if (existingUser != null)
    {
        return BadRequest(new { message = "Email đã tồn tại." });
    }

    string hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password);

    var newUser = new User
    {
        Username = request.Name,
        Email = request.Email,
        Password = hashedPassword,
        RoleId = request.RoleId,
        CreatedAt = DateTime.UtcNow
    };

    _context.Users.Add(newUser);
    await _context.SaveChangesAsync();

    // Nếu là employer hoặc candidate thì tạo profile
    if (request.RoleId == 2)
    {
        var employer = new CompanyProfile
        {
            UserId = newUser.Id,
            CompanyName = "Chưa cập nhật"
        };
        _context.CompanyProfiles.Add(employer);
    }
    else if (request.RoleId == 3)
    {
        var candidate = new CandidateProfile
        {
            UserId = newUser.Id,
        };
        _context.CandidateProfiles.Add(candidate);
    }

    await _context.SaveChangesAsync();

    string role = await _context.UserRoles
        .Where(r => r.Id == newUser.RoleId)
        .Select(r => r.Name)
        .FirstOrDefaultAsync() ?? "user";

    // ✅ Đăng nhập tự động sau đăng ký
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
    public async Task<IActionResult> GetAllUsers([FromQuery] int page = 1, [FromQuery] int pageSize = 5)
    {
        var baseUrl = $"{Request.Scheme}://{Request.Host}/";

        var totalUsers = await _context.Users.CountAsync();

        var users = await _context.Users
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
                    : (u.Avatar.StartsWith("https") ? u.Avatar : baseUrl + "uploads/avatars/" + u.Avatar)
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

    [HttpPost("google-login")]
    public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginRequest request)
    {
        var settings = new GoogleJsonWebSignature.ValidationSettings
        {
            Audience = new List<string?> { _config["GoogleAuth:ClientId"] }
        };

        GoogleJsonWebSignature.Payload payload;
        try
        {
            payload = await GoogleJsonWebSignature.ValidateAsync(request.Token, settings);
        }
        catch (Exception)
        {
            return BadRequest(new { message = "Token không hợp lệ!" });
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == payload.Email);

        // Nếu chưa có user, yêu cầu chọn vai trò
        if (user == null)
        {
            return Ok(new
            {
                requireRoleSelection = true,
                email = payload.Email,
                name = payload.Name,
                avatar = payload.Picture
            });
        }

        var role = await _context.UserRoles
                                  .Where(r => r.Id == user.RoleId)
                                  .Select(r => r.Name)
                                  .FirstOrDefaultAsync() ?? "user";

        // ✅ Tạo cookie đăng nhập
        var claims = new List<Claim>
    {
        new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
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
            message = "Đăng nhập Google thành công",
            user = new
            {
                user.Id,
                user.Username,
                user.Email,
                user.Avatar,
                Role = role
            }
        });
    }


    [HttpPost("register-with-google")]
    public async Task<IActionResult> RegisterWithGoogle([FromBody] RegisterGoogleRequest request)
    {
        var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (existingUser != null)
        {
            return BadRequest(new { message = "Người dùng đã tồn tại!" });
        }

        var role = await _context.UserRoles.FirstOrDefaultAsync(r => r.Id == request.RoleId);
        if (role == null)
        {
            return BadRequest(new { message = "Vai trò không hợp lệ." });
        }

        var newUser = new User
        {
            Username = request.Name ?? "Người dùng mới",
            Email = request.Email ?? "",
            Avatar = request.Avatar,
            RoleId = request.RoleId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(newUser);
        await _context.SaveChangesAsync();

        // Nếu là employer hoặc candidate thì tạo profile
        if (request.RoleId == 2)
        {
            var company = new CompanyProfile
            {
                UserId = newUser.Id,
                CompanyName = "Chưa cập nhật"
            };
            _context.CompanyProfiles.Add(company);
        }
        else if (request.RoleId == 3)
        {
            var candidate = new CandidateProfile
            {
                UserId = newUser.Id
            };
            _context.CandidateProfiles.Add(candidate);
        }

        await _context.SaveChangesAsync();

        // ✅ Tạo cookie đăng nhập giống như login thường
        var claims = new List<Claim>
    {
        new Claim(ClaimTypes.NameIdentifier, newUser.Id.ToString()),
        new Claim(ClaimTypes.Role, role.Name)
    };

        var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
        var authProperties = new AuthenticationProperties
        {
            IsPersistent = true,
            ExpiresUtc = DateTimeOffset.UtcNow.AddHours(100)
        };

        await HttpContext.SignInAsync(
            CookieAuthenticationDefaults.AuthenticationScheme,
            new ClaimsPrincipal(claimsIdentity),
            authProperties);

        return Ok(new
        {
            message = "Đăng ký Google thành công",
            user = new
            {
                newUser.Id,
                newUser.Username,
                newUser.Email,
                newUser.Avatar,
                Role = role.Name
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





