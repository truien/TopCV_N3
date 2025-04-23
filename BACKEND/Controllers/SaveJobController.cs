using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BACKEND.Models;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

[Route("api/[controller]")]
[ApiController]
public class SaveJobController : ControllerBase
{
    private readonly TopcvBeContext _context;

    public SaveJobController(TopcvBeContext context)
    {
        _context = context;
    }

    [Authorize]
    [HttpPost("save-job/{jobPostId}")]
    public async Task<IActionResult> SaveJob(int jobPostId)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdStr))
            return Unauthorized();

        int userId = int.Parse(userIdStr);



        var jobExists = await _context.JobPosts.AnyAsync(j => j.Id == jobPostId);
        if (!jobExists)
            return NotFound(new { message = "Không tìm thấy công việc này." });

        var alreadySaved = await _context.Set<SavedJob>()
            .AnyAsync(s => s.UserId == userId && s.JobPostId == jobPostId);

        if (alreadySaved)
            return BadRequest(new { message = "Bạn đã lưu công việc này rồi." });

        var savedJob = new SavedJob
        {
            UserId = userId,
            JobPostId = jobPostId
        };

        _context.Set<SavedJob>().Add(savedJob);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Lưu tin tuyển dụng thành công." });
    }

    [Authorize]
    [HttpDelete("unsave-job/{jobPostId}")]
    public async Task<IActionResult> UnsaveJob(int jobPostId)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdStr))
            return Unauthorized();

        int userId = int.Parse(userIdStr);


        var savedJob = await _context.Set<SavedJob>()
            .FirstOrDefaultAsync(s => s.UserId == userId && s.JobPostId == jobPostId);

        if (savedJob == null)
            return NotFound(new { message = "Bạn chưa lưu công việc này." });

        _context.Set<SavedJob>().Remove(savedJob);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Bỏ lưu tin tuyển dụng thành công." });
    }

    [Authorize]
    [HttpGet("saved-jobs")]
    public async Task<IActionResult> GetSavedJobs()
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdStr))
            return Unauthorized();

        int userId = int.Parse(userIdStr);


#pragma warning disable CS8602 // Dereference of a possibly null reference.
        var savedJobs = await _context.Set<SavedJob>()
            .Include(s => s.JobPost)
                .ThenInclude(j => j.Employer)
                    .ThenInclude(e => e.CompanyProfiles)
            .Where(s => s.UserId == userId)
            .Select(s => new
            {
                s.JobPost.Id,
                s.JobPost.Title,
                s.JobPost.Location,
                s.JobPost.SalaryRange,
                CompanyName = s.JobPost.Employer.CompanyProfiles.FirstOrDefault().CompanyName,
                s.JobPost.ApplyDeadline
            })
            .ToListAsync();
#pragma warning restore CS8602 // Dereference of a possibly null reference.

        return Ok(savedJobs);
    }
}
