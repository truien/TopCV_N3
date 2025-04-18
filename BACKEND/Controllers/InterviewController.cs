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
            i.JobId == dto.JobId && i.CandidateUserId == dto.candidateUserId);
        if (already)
            return BadRequest("Ứng viên này đã có lịch phỏng vấn cho công việc này.");

        var interview = new Interview
        {
            JobId = dto.JobId,
            EmployerId = employerId,
            CandidateUserId = dto.candidateUserId,
            Message = dto.Message,
            Status = "pending",
            CreatedAt = DateTime.UtcNow
        };
        _context.Interviews.Add(interview);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Lịch phỏng vấn đã được tạo." });
    }
    [Authorize(Roles = "employer")]
    [HttpGet("employer/all")]
    public async Task<IActionResult> GetAllInterviews()
    {
        var employerIdClaim = _http.HttpContext?.User?.Claims?.FirstOrDefault(c => c.Type == "id");
        if (employerIdClaim == null) return Unauthorized();
        int employerId = int.Parse(employerIdClaim.Value);

#pragma warning disable CS8602
        var interviews = await _context.Interviews
            .Include(i => i.Job)
            .Include(i => i.CandidateUser)
                .ThenInclude(u => u.CandidateProfiles)
            .Where(i => i.EmployerId == employerId)
            .OrderByDescending(i => i.CreatedAt)
            .Select(i => new
            {

                Id = i.Id,
                JobId = i.Job.Id,
                JobTitle = i.Job.Title,
                CandidateName = i.CandidateUser.CandidateProfiles.FirstOrDefault().Fullname ?? i.CandidateUser.Username,
                Email = i.CandidateUser.Email,
                i.Status,
                i.CreatedAt
            })
            .ToListAsync();
#pragma warning restore CS8602

        return Ok(interviews);
    }

    [Authorize(Roles = "employer")]
    [HttpGet("employer/active")]
    public async Task<IActionResult> GetActiveJobPosts()
    {
        var employerId = int.Parse(User.Claims.First(c => c.Type == "id").Value);
        var jobs = await _context.JobPosts
            .Where(j => j.EmployerId == employerId && j.Status == "open")
            .Select(j => new { j.Id, j.Title })
            .ToListAsync();

        return Ok(jobs);
    }

    [Authorize(Roles = "employer")]
    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateInterviewStatus(int id, [FromBody] string status)
    {
        var interview = await _context.Interviews.FindAsync(id);
        if (interview == null) return NotFound();

        if (status != "pending" && status != "accepted" && status != "declined")
            return BadRequest("Trạng thái không hợp lệ.");

        interview.Status = status;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Cập nhật trạng thái thành công." });
    }

    [Authorize(Roles = "candidate")]
    [HttpGet("candidate/received")]
    public async Task<IActionResult> GetCandidateInterviews()
    {
        var userId = int.Parse(User.Claims.First(c => c.Type == "id").Value);

#pragma warning disable CS8602 // Dereference of a possibly null reference.
        var interviews = await _context.Interviews
            .Include(i => i.Job)
            .Include(i => i.Employer)
                .ThenInclude(e => e.CompanyProfiles)
            .Where(i => i.CandidateUserId == userId)
            .OrderByDescending(i => i.CreatedAt)
            .Select(i => new
            {
                i.Id,
                JobTitle = i.Job.Title,
                Company = i.Employer.CompanyProfiles.FirstOrDefault().CompanyName,
                i.Status,
                i.Message,
                i.CreatedAt
            })
            .ToListAsync();
#pragma warning restore CS8602 // Dereference of a possibly null reference.

        return Ok(interviews);
    }

}
