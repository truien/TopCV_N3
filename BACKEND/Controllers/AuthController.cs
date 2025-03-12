using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;
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
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Name == request.Username);
        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.Password))
        {
            return Unauthorized(new { message = "Invalid username or password" });
        }

        string role = await _context.UserRoles.Where(r => r.Id == user.RoleId).Select(r => r.Name).FirstOrDefaultAsync() ?? "user";

        string token = GenerateJwtToken(user, role);

        return Ok(new UserResponse
        {
            Id = user.Id,
            Username = user.Name,
            Role = role,
            Token = token
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
            Name = request.Name,
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
                CvTitle = "Chưa có CV"
            };
            _context.CandidateProfiles.Add(candidate);
        }

        await _context.SaveChangesAsync();

        string role = await _context.UserRoles.Where(r => r.Id == newUser.RoleId).Select(r => r.Name).FirstOrDefaultAsync() ?? "user";


        string token = GenerateJwtToken(newUser, role);

        return Ok(new UserResponse
        {
            Id = newUser.Id,
            Username = newUser.Name,
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
        new Claim(JwtRegisteredClaimNames.Sub, user.Name),
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
        Console.WriteLine($"DEBUG: Claims = {string.Join(", ", claims.Select(c => $"{c.Type}: {c.Value}"))}");


        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
