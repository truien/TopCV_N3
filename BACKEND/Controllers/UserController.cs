using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BACKEND.Models;
using Microsoft.AspNetCore.Authorization;
[Route("api/[controller]")]
[ApiController]
public class UserController : ControllerBase
{
    private readonly TopcvBeContext _context;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public UserController(TopcvBeContext context, IHttpContextAccessor httpContextAccessor)
    {
        _context = context;
        _httpContextAccessor = httpContextAccessor;
    }

    [Authorize]
    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        var userIdClaim = _httpContextAccessor.HttpContext?.User?.Claims?.FirstOrDefault(c => c.Type == "id");

        if (userIdClaim == null)
            return Unauthorized(new { message = "Không xác định được người dùng." });

        int userId = int.Parse(userIdClaim.Value);

        var user = await _context.Users
            .Include(u => u.Role)
            .Include(u => u.CandidateProfiles)
            .Include(u => u.CompanyProfiles)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
            return NotFound(new { message = "Không tìm thấy người dùng." });

        string fullName;

        if (user.Role?.Name?.ToLower() == "admin")
        {
            fullName = "Admin";
        }
        else
        {
            fullName = user.CandidateProfiles.FirstOrDefault()?.Fullname ??
                        user.CompanyProfiles.FirstOrDefault()?.CompanyName ??
                        user.Username;
        }

        string? avatar = !string.IsNullOrEmpty(user.Avatar)
    ? (user.Avatar.StartsWith("http") ? user.Avatar : $"{Request.Scheme}://{Request.Host}/uploads/avatars/{user.Avatar}")
    : null;


        return Ok(new
        {
            user.Id,
            Username = user.Username,
            FullName = fullName,
            Avatar = avatar,
            Role = user.Role?.Name ?? "user"
        });
    }
}
