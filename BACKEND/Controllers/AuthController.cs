using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;
using Microsoft.AspNetCore.Authorization;
using BACKEND.Models;

[Route("api/auth")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly TopcvBeContext _context;
    private readonly IConfiguration _config;

    public AuthController(TopcvBeContext context, IConfiguration config)
    {
        _context = context;
        _config = config;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var baseUrl = $"{Request.Scheme}://{Request.Host}/";
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == request.Username);
        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.Password))
        {
            return Unauthorized(new { message = "Invalid username or password" });
        }

        string role = await _context.UserRoles.Where(r => r.Id == user.RoleId).Select(r => r.Name).FirstOrDefaultAsync() ?? "user";

        string token = GenerateJwtToken(user, role);

        return Ok(new UserResponse
        {
            Id = user.Id,
            Username = user.Username,
            Role = role,
            Token = token,
            Avatar = string.IsNullOrEmpty(user.Avatar) ? "" : baseUrl + "avatar/" + user.Avatar,
        });
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

        string role = await _context.UserRoles.Where(r => r.Id == newUser.RoleId).Select(r => r.Name).FirstOrDefaultAsync() ?? "user";


        string token = GenerateJwtToken(newUser, role);

        return Ok(new UserResponse
        {
            Id = newUser.Id,
            Username = newUser.Username,
            Role = role,
            Token = token
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
    [HttpGet("users")]
    public async Task<IActionResult> GetAllUsers()
    {
        var baseUrl = $"{Request.Scheme}://{Request.Host}/";

        var users = await _context.Users
            .Select(u => new
            {
                Id = u.Id,
                Username = u.Username,
                Email = u.Email,
                Role = _context.UserRoles.Where(r => r.Id == u.RoleId).Select(r => r.Name).FirstOrDefault(),
                Avatar = string.IsNullOrEmpty(u.Avatar) ? "" : baseUrl + "uploads/avatars/" + u.Avatar,
                CreatedAt = u.CreatedAt
            })
            .ToListAsync();

        return Ok(users);
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

        return Ok(new { message = "Xóa người dùng thành công!" });
    }


}
