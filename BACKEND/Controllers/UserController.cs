using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BACKEND.Models;

[Route("api/user")]
[ApiController]
public class UserController : ControllerBase
{
    private readonly TopcvBeContext _context;
    private readonly IConfiguration _configuration;

    public UserController(TopcvBeContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(User user)
    {
        var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == user.Email);
        if (existingUser != null) return BadRequest("Email already exists");

        user.Password = BCrypt.Net.BCrypt.HashPassword(user.Password);
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return Ok("User registered successfully");
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.Password))
            return Unauthorized("Invalid email or password");

        // Tạo token
        var accessToken = GenerateJwtToken(user);
        var refreshToken = GenerateRefreshToken();

        // Lưu refresh token vào database
        var userToken = new UserToken
        {
            UserId = user.Id,
            RefreshToken = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddDays(7) // Refresh token có hiệu lực 7 ngày
        };

        _context.UserTokens.Add(userToken);
        await _context.SaveChangesAsync();

        return Ok(new { accessToken, refreshToken });
    }

    [Authorize]
    [HttpGet]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _context.Users.ToListAsync();
        return Ok(users);
    }

    [Authorize]
    [HttpGet("{id}")]
    public async Task<IActionResult> GetUser(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound();
        return Ok(user);
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshRequest request)
    {
        var userToken = await _context.UserTokens
            .FirstOrDefaultAsync(t => t.RefreshToken == request.RefreshToken);

        if (userToken == null || userToken.ExpiresAt < DateTime.UtcNow)
            return Unauthorized("Invalid or expired refresh token");

        var user = await _context.Users.FindAsync(userToken.UserId);
        if (user == null) return Unauthorized("User not found");

        var newAccessToken = GenerateJwtToken(user);
        var newRefreshToken = GenerateRefreshToken();

        // Cập nhật refresh token mới vào database
        userToken.RefreshToken = newRefreshToken;
        userToken.ExpiresAt = DateTime.UtcNow.AddDays(7);
        await _context.SaveChangesAsync();

        return Ok(new { accessToken = newAccessToken, refreshToken = newRefreshToken });
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout([FromBody] LogoutRequest request)
    {
        var userToken = await _context.UserTokens
            .FirstOrDefaultAsync(t => t.RefreshToken == request.RefreshToken);

        if (userToken != null)
        {
            _context.UserTokens.Remove(userToken);
            await _context.SaveChangesAsync();
        }

        return Ok("Logged out successfully");
    }

    private string GenerateJwtToken(User user)
    {
        var secret = _configuration["JwtSettings:Secret"];

        if (string.IsNullOrEmpty(secret))
        {
            throw new ArgumentNullException("JwtSettings:Secret is missing in configuration.");
        }

        var key = Encoding.UTF8.GetBytes(secret);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role)
            }),
            Expires = DateTime.UtcNow.AddHours(2),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    private string GenerateRefreshToken()
    {
        return Convert.ToBase64String(Guid.NewGuid().ToByteArray());
    }
}
