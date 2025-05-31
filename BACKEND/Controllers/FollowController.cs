using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BACKEND.Models;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

[Route("api/[controller]")]
[ApiController]
public class FollowController : ControllerBase
{
    private readonly TopcvBeContext _context;
    private readonly NotificationService _notificationService;

    public FollowController(TopcvBeContext context, NotificationService notificationService)
    {
        _context = context;
        _notificationService = notificationService;
    }

    [Authorize]
    [HttpPost("follow-employer/{employerId}")]
    public async Task<IActionResult> FollowEmployer(int employerId)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdStr))
            return Unauthorized();

        int userId = int.Parse(userIdStr);


        var existingFollow = await _context.UserFollows
            .AnyAsync(f => f.UserId == userId && f.EmployerId == employerId);

        if (existingFollow)
            return BadRequest(new { message = "Bạn đã theo dõi công ty này rồi." });
        var follow = new UserFollow
        {
            UserId = userId,
            EmployerId = employerId
        }; _context.UserFollows.Add(follow);
        await _context.SaveChangesAsync();
        // Gửi thông báo cho công ty 
        await _notificationService.CreateFollowNotificationAsync(userId, employerId);

        return Ok(new { message = "Theo dõi công ty thành công." });
    }

    [Authorize]
    [HttpDelete("unfollow-employer/{employerId}")]
    public async Task<IActionResult> UnfollowEmployer(int employerId)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdStr))
            return Unauthorized();

        int userId = int.Parse(userIdStr);


        var follow = await _context.UserFollows
            .FirstOrDefaultAsync(f => f.UserId == userId && f.EmployerId == employerId);

        if (follow == null)
            return NotFound(new { message = "Bạn chưa theo dõi công ty này." });

        _context.UserFollows.Remove(follow);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Bỏ theo dõi công ty thành công." });
    }

    [Authorize]
    [HttpGet("is-following/{employerId}")]
    public async Task<IActionResult> IsFollowing(int employerId)
    {
#pragma warning disable CS8604 // Possible null reference argument.
        int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
#pragma warning restore CS8604 // Possible null reference argument.
        bool isFollowing = await _context.UserFollows
            .AnyAsync(f => f.UserId == userId && f.EmployerId == employerId);
        return Ok(new { isFollowing });
    }
    [HttpGet("employer/{employerId}/followers-count")]
    public async Task<IActionResult> GetFollowerCount(int employerId)
    {
        int count = await _context.UserFollows.CountAsync(f => f.EmployerId == employerId);
        return Ok(new { followerCount = count });
    }

}
