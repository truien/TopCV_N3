using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using BACKEND.Models;
using Google.Apis.Auth;
using BACKEND.Services;
using System.Security.Cryptography;
using StackExchange.Redis;



[Route("api/auth")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly TopcvBeContext _context;
    private readonly IConfiguration _config;
    private readonly EmailService _emailService;
    private readonly IJwtService _jwt;
    private readonly ITokenService _token;
    private readonly IConnectionMultiplexer _redis;
    private readonly IWebHostEnvironment _env;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public AuthController(TopcvBeContext context, IConfiguration config, EmailService emailService, IJwtService jwt, ITokenService token, IConnectionMultiplexer redis, IWebHostEnvironment env, IHttpContextAccessor httpContextAccessor)
    {
        _context = context;
        _config = config;
        _emailService = emailService;
        _jwt = jwt;
        _token = token;
        _redis = redis;
        _env = env;
        _httpContextAccessor = httpContextAccessor;
    }

    private CookieOptions GetCookieOptions(TimeSpan expires)
    {
        var httpContext = _httpContextAccessor.HttpContext;
        var isHttps = httpContext?.Request.IsHttps == true || httpContext?.Request.Scheme == "https";
        return new CookieOptions
        {
            HttpOnly = true,
            Secure = isHttps, // Secure phải true nếu dùng HTTPS
            SameSite = SameSiteMode.None, // Cần cho cross-origin
            Path = "/",
            Expires = DateTime.UtcNow.Add(expires)
        };
    }
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest dto)
    {
        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Username == dto.Username);

        if (user == null)
            return Unauthorized(new { message = "Tài khoản không tồn tại." });

        if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.Password))
            return Unauthorized(new { message = "Sai mật khẩu." });

        string role = user.Role?.Name ?? "user";

        var accessToken = _jwt.GenerateAccessToken(user, role);
        var (plain, hash, exp) = _token.CreateRefreshToken();
        await _token.SaveAsync(user.Id, hash, exp);

        var cookieOptions = GetCookieOptions(TimeSpan.FromMinutes(15));
        Response.Cookies.Append("access", accessToken, cookieOptions);
        
        var refreshCookieOptions = GetCookieOptions(TimeSpan.FromDays(7));
        Response.Cookies.Append("refresh", plain, refreshCookieOptions);
        
        // Lưu user_id vào cookie để dùng khi refresh
        var userIdCookieOptions = GetCookieOptions(TimeSpan.FromDays(7));
        Response.Cookies.Append("user_id", user.Id.ToString(), userIdCookieOptions);
        
        Console.WriteLine($"[Login] Cookie set - Secure: {cookieOptions.Secure}, SameSite: {cookieOptions.SameSite}, IsHttps: {Request.IsHttps}, Scheme: {Request.Scheme}");

        return Ok(new { message = "Đăng nhập thành công" });
    }
    private static string Sha256(string input)
    {
        using var sha = SHA256.Create();
        var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(input));
        return Convert.ToHexString(bytes);
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh([FromBody] RefreshRequest? dto = null)
    {
        // Đọc refresh token từ cookie
        var refreshToken = Request.Cookies["refresh"];
        
        if (string.IsNullOrEmpty(refreshToken))
        {
            return Unauthorized(new { message = "Refresh token không tìm thấy." });
        }

        // Đọc user_id từ cookie (hoặc từ body nếu có)
        var userIdStr = Request.Cookies["user_id"];
        if (string.IsNullOrEmpty(userIdStr) && dto != null && dto.UserId > 0)
        {
            userIdStr = dto.UserId.ToString();
        }
        
        if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
        {
            return Unauthorized(new { message = "User ID không hợp lệ." });
        }

        var hash = Sha256(refreshToken);
        var valid = await _token.ValidateAsync(userId, hash);

        if (!valid)
        {
            return Unauthorized(new { message = "Refresh token không hợp lệ hoặc đã hết hạn." });
        }

        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
        {
            return Unauthorized(new { message = "User không tồn tại." });
        }

        string role = user.Role?.Name ?? "user";
        var accessToken = _jwt.GenerateAccessToken(user, role);

        var cookieOptions = GetCookieOptions(TimeSpan.FromMinutes(15));
        Response.Cookies.Append("access", accessToken, cookieOptions);

        return Ok(new { message = "Đã cấp lại access token." });
    }
    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentUser()
    {
        Console.WriteLine($"[Me] Request received. Cookies count: {Request.Cookies.Count}");
        foreach (var cookie in Request.Cookies)
        {
            Console.WriteLine($"[Me] Cookie: {cookie.Key} = {cookie.Value?.Substring(0, Math.Min(20, cookie.Value?.Length ?? 0))}...");
        }
        
        int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        Console.WriteLine("Current User ID: " + userId);
        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
            return NotFound();

        return Ok(new
        {
            id = user.Id,
            username = user.Username,
            email = user.Email,
            role = user.Role?.Name
        });
    }
    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        await _token.RevokeAllAsync(userId);

        Response.Cookies.Delete("access");
        Response.Cookies.Delete("refresh");
        Response.Cookies.Delete("user_id");

        return Ok(new { message = "Đã đăng xuất." });
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (existingUser != null)
            return BadRequest(new { message = "Email đã tồn tại." });

        var roleExists = await _context.UserRoles.AnyAsync(r => r.Id == request.RoleId);
        if (!roleExists)
            request.RoleId = 2;

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

        if (request.RoleId == 1) // employer
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

        var accessToken = _jwt.GenerateAccessToken(newUser, role);
        var (plain, hash, exp) = _token.CreateRefreshToken();
        await _token.SaveAsync(newUser.Id, hash, exp);

        var cookieOptions = GetCookieOptions(TimeSpan.FromMinutes(15));
        Response.Cookies.Append("access", accessToken, cookieOptions);
        
        var refreshCookieOptions = GetCookieOptions(TimeSpan.FromDays(7));
        Response.Cookies.Append("refresh", plain, refreshCookieOptions);
        
        // Lưu user_id vào cookie
        var userIdCookieOptions = GetCookieOptions(TimeSpan.FromDays(7));
        Response.Cookies.Append("user_id", newUser.Id.ToString(), userIdCookieOptions);

        return Ok(new { message = "Đăng ký thành công" });
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

        // 2️⃣ Tìm user theo email
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == payload.Email);

        // 3️⃣ Nếu chưa có user → tạo mới
        if (user == null)
        {
            // 3a. Nếu FE chưa chọn role → yêu cầu chọn
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

            // 3b. Tạo mới user
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

            // 3c. Tạo profile tương ứng
            if (request.RoleId.Value == 1) // Employer
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
            else if (request.RoleId.Value == 3) // Candidate
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

        // 4 Sinh token JWT + refresh token thay vì cookie
        var roleName = await _context.UserRoles
            .Where(r => r.Id == user.RoleId)
            .Select(r => r.Name)
            .FirstOrDefaultAsync() ?? "user";

        var accessToken = _jwt.GenerateAccessToken(user, roleName);
        var (plain, hash, exp) = _token.CreateRefreshToken();
        await _token.SaveAsync(user.Id, hash, exp);

        var cookieOptions = GetCookieOptions(TimeSpan.FromMinutes(15));
        Response.Cookies.Append("access", accessToken, cookieOptions);
        
        var refreshCookieOptions = GetCookieOptions(TimeSpan.FromDays(7));
        Response.Cookies.Append("refresh", plain, refreshCookieOptions);
        
        // Lưu user_id vào cookie
        var userIdCookieOptions = GetCookieOptions(TimeSpan.FromDays(7));
        Response.Cookies.Append("user_id", user.Id.ToString(), userIdCookieOptions);

        return Ok(new { message = "Đăng nhập Google thành công" });
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        if (string.IsNullOrEmpty(request.Email))
            return BadRequest(new { message = "Email không được để trống" });

        var user = _context.Users.FirstOrDefault(u => u.Email == request.Email);
        if (user == null)
            return BadRequest(new { message = "Email không tồn tại trong hệ thống." });

        var db = _redis.GetDatabase();
        string otpKey = $"otp:{request.Email}";

        if (await db.KeyExistsAsync(otpKey))
            return BadRequest(new { message = "OTP đã được gửi, vui lòng kiểm tra email hoặc chờ 5 phút." });

        string otp = new Random().Next(100000, 999999).ToString();
        await db.StringSetAsync(otpKey, otp, TimeSpan.FromMinutes(5)); // TTL = 5 phút

        _emailService.SendEmail(
            request.Email,
            "Mã OTP đặt lại mật khẩu",
            $"Mã OTP của bạn là: {otp}. Mã này có hiệu lực trong 5 phút."
        );

        return Ok(new { message = "OTP đã được gửi đến email của bạn." });
    }


    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        if (string.IsNullOrEmpty(request.Email) ||
            string.IsNullOrEmpty(request.NewPassword) ||
            string.IsNullOrEmpty(request.OTP))
            return BadRequest(new { message = "Email, OTP và mật khẩu mới không được để trống." });

        var db = _redis.GetDatabase();
        string otpKey = $"otp:{request.Email}";
        string attemptKey = $"otp_attempt:{request.Email}";
        int attempts = (int)(await db.StringIncrementAsync(attemptKey));
        if (attempts > 3)
            return BadRequest(new { message = "Bạn đã nhập sai OTP quá 3 lần. Vui lòng gửi lại OTP mới." });

        await db.KeyExpireAsync(attemptKey, TimeSpan.FromMinutes(5));
        string? storedOtp = await db.StringGetAsync(otpKey);

        if (string.IsNullOrEmpty(storedOtp) || storedOtp != request.OTP)
            return BadRequest(new { message = "OTP không hợp lệ hoặc đã hết hạn." });

        var user = _context.Users.FirstOrDefault(u => u.Email == request.Email);
        if (user == null)
            return BadRequest(new { message = "Email không tồn tại." });

        user.Password = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        _context.SaveChanges();

        await db.KeyDeleteAsync(otpKey);

        return Ok(new { message = "Mật khẩu đã được đặt lại thành công." });
    }

}





