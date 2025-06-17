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
    public async Task<IActionResult> GetSavedJobs([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdStr))
            return Unauthorized();

        int userId = int.Parse(userIdStr);

        // Đảm bảo page và pageSize hợp lệ
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 50);

        // Tính toán số lượng bỏ qua
        int skip = (page - 1) * pageSize;

        // Lấy tổng số lượng công việc đã lưu
        int totalCount = await _context.Set<SavedJob>()
            .Where(s => s.UserId == userId)
            .CountAsync();

        // Tính toán tổng số trang
        int totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

        // Lấy danh sách công việc đã lưu với phân trang
#pragma warning disable CS8602 // Dereference of a possibly null reference.
        var savedJobs = await _context.Set<SavedJob>()
            .Include(s => s.JobPost)
                .ThenInclude(j => j.Employer)
                    .ThenInclude(e => e.CompanyProfiles)
            .Include(s => s.JobPost)
                .ThenInclude(j => j.JobPostEmploymentTypes)
                    .ThenInclude(jpe => jpe.EmploymentType).Include(s => s.JobPost)
                .ThenInclude(j => j.JobPostFields)
                    .ThenInclude(jpf => jpf.Field)
            .Where(s => s.UserId == userId)
            .OrderByDescending(s => s.JobPost.PostDate)
            .Skip(skip)
            .Take(pageSize)
            .Select(s => new
            {
                s.JobPost.Id,
                s.JobPost.Title,
                s.JobPost.Location,
                s.JobPost.SalaryRange,
                s.JobPost.PostDate,
                s.JobPost.ApplyDeadline,
                Employer = new
                {
                    CompanyName = s.JobPost.Employer.CompanyProfiles.FirstOrDefault().CompanyName,
                    Avatar = s.JobPost.Employer.Avatar
                },
                Fields = s.JobPost.JobPostFields.Select(jpf => jpf.Field.Name).ToList(),
                Employment = s.JobPost.JobPostEmploymentTypes.Select(jpe => jpe.EmploymentType.Name).ToList()
            })
            .ToListAsync();
#pragma warning restore CS8602 // Dereference of a possibly null reference.

        // Trả về kết quả với thông tin phân trang
        return Ok(new
        {
            Items = savedJobs,
            TotalCount = totalCount,
            TotalPages = totalPages,
            CurrentPage = page,
            PageSize = pageSize
        });
    }

    [Authorize]
    [HttpGet("check-saved/{jobPostId}")]
    public async Task<IActionResult> CheckJobSaved(int jobPostId)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdStr))
            return Unauthorized();

        int userId = int.Parse(userIdStr);

        var isSaved = await _context.Set<SavedJob>()
            .AnyAsync(s => s.UserId == userId && s.JobPostId == jobPostId);

        return Ok(new { isSaved });
    }
}
