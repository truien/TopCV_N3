using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BACKEND.Models;
using Microsoft.AspNetCore.Authorization;

[ApiController]
[Route("api/[controller]")]
public class ReportController : ControllerBase
{
    private readonly TopcvBeContext _context;
    private readonly IHttpContextAccessor _http;

    public ReportController(TopcvBeContext context, IHttpContextAccessor http)
    {
        _context = context;
        _http = http;
    }

    [Authorize]
    [HttpPost("job")]
    public async Task<IActionResult> ReportJobPost([FromBody] ReportJobPostDto dto)
    {
        var userIdClaim = _http.HttpContext?.User?.Claims?.FirstOrDefault(c => c.Type == "id");
        if (userIdClaim == null) return Unauthorized("Không xác định người dùng.");

        int userId = int.Parse(userIdClaim.Value);

        var jobPost = await _context.JobPosts.FindAsync(dto.JobPostId);
        if (jobPost == null) return NotFound("Không tìm thấy bài tuyển dụng.");

        var isDuplicate = await _context.JobPostReports.AnyAsync(r =>
            r.JobPostId == dto.JobPostId && r.ReportedBy == userId);
        if (isDuplicate) return BadRequest("Bạn đã báo cáo bài viết này rồi.");

#pragma warning disable CS8601 
        var report = new JobPostReport
        {
            JobPostId = dto.JobPostId,
            ReportedBy = userId,
            Reason = dto.Reason,
            Description = dto.Description,
            CreatedAt = DateTime.UtcNow,
            Status = "pending"
        };
#pragma warning restore CS8601

        _context.JobPostReports.Add(report);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Đã gửi báo cáo bài viết." });
    }
}
