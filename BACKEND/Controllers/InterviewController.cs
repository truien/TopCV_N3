using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BACKEND.Models;
using Microsoft.AspNetCore.Authorization;
[ApiController]
[Route("api/[controller]")]
public class InterviewController : ControllerBase
{
    private readonly TopcvBeContext _context;
    private readonly IHttpContextAccessor _http;

    public InterviewController(TopcvBeContext context, IHttpContextAccessor http)
    {
        _context = context;
        _http = http;
    }

    [Authorize(Roles = "employer")]
    [HttpPost("schedule")]
    public async Task<IActionResult> ScheduleInterview([FromBody] ScheduleInterviewDto dto)
    {
        var employerIdClaim = _http.HttpContext?.User?.Claims?.FirstOrDefault(c => c.Type == "id");
        if (employerIdClaim == null) return Unauthorized();
        int employerId = int.Parse(employerIdClaim.Value);

        var job = await _context.JobPosts.FindAsync(dto.JobId);
        if (job == null || job.EmployerId != employerId)
            return BadRequest("Không tìm thấy job hoặc bạn không sở hữu job này.");

        var already = await _context.Interviews.AnyAsync(i =>
            i.JobId == dto.JobId && i.ApplicantId == dto.ApplicantId);
        if (already)
            return BadRequest("Ứng viên này đã có lịch phỏng vấn cho công việc này.");

        var interview = new Interview
        {
            JobId = dto.JobId,
            EmployerId = employerId,
            ApplicantId = dto.ApplicantId,
            Message = dto.Message,
            Status = "pending",
            CreatedAt = DateTime.UtcNow
        };

        _context.Interviews.Add(interview);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Lịch phỏng vấn đã được tạo." });
    }
}
