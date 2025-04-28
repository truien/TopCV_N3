using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BACKEND.Models;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
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
        var userIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier);

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
    [Authorize(Roles = "candidate")]
    [HttpGet("cv")]
    public async Task<IActionResult> GetCvInfo()
    {
        var userIdStr = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdStr))
            return Unauthorized(new { message = "Không xác định được người dùng." });

        int userId = int.Parse(userIdStr);


        var cv = await _context.CandidateProfiles
            .Where(cp => cp.UserId == userId)
            .Select(cp => new
            {
                cp.CvFilePath
            })
            .FirstOrDefaultAsync();

        return Ok(new
        {
            HasCv = !string.IsNullOrEmpty(cv?.CvFilePath),
            CvFile = cv?.CvFilePath
        });
    }

    [Authorize(Roles = "employer")]
    [HttpGet("pro-subscription")]
    public async Task<IActionResult> GetProSubscription()
    {
        var userIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier);

        if (userIdClaim == null)
            return Unauthorized(new { message = "Không xác định được người dùng." });

        int userId = int.Parse(userIdClaim.Value);
        var now = DateTime.UtcNow;

        var pro = await _context.ProSubscriptions
            .Where(p => p.UserId == userId && p.StartDate <= now && p.EndDate >= now)
            .Select(p => new
            {
                p.StartDate,
                p.EndDate,
                p.PostsLeftThisPeriod
            })
            .FirstOrDefaultAsync();

        if (pro == null)
        {
            var monthStart = new DateTime(now.Year, now.Month, 1);

            int postsThisMonth = await _context.JobPosts
                .Where(j => j.EmployerId == userId && j.PostDate >= monthStart)
                .CountAsync();

            int freeQuota = 5;
            int postsLeft = Math.Max(0, freeQuota - postsThisMonth);

            return Ok(new
            {
                isPro = false,
                postsLeft = postsLeft
            });
        }


        return Ok(new
        {
            isPro = true,
            startDate = pro.StartDate,
            endDate = pro.EndDate,
            postsLeft = pro.PostsLeftThisPeriod
        });
    }

}
