using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using BACKEND.Models;
using BACKEND.Enums;
[ApiController]
[Route("api/[controller]")]
public class InterviewController : ControllerBase
{
    private readonly TopcvBeContext _context;
    private readonly IHttpContextAccessor _http;
    private readonly IConfiguration _config;
    private readonly EmailService _emailService;

    public InterviewController(TopcvBeContext context, IHttpContextAccessor http, IConfiguration config, EmailService emailService)
    {
        _context = context;
        _http = http;
        _config = config;
        _emailService = emailService;
    }


    [Authorize(Roles = "employer")]
    [HttpPost("schedule")]
    public async Task<IActionResult> ScheduleInterview([FromBody] ScheduleInterviewDto dto)
    {
        var employerIdClaim = _http.HttpContext?.User?.Claims?.FirstOrDefault(c => c.Type == "id");
        if (employerIdClaim == null) return Unauthorized();
        int employerId = int.Parse(employerIdClaim.Value);

        // Kiểm tra công việc tồn tại và thuộc quyền của nhà tuyển dụng
        var job = await _context.JobPosts.FindAsync(dto.JobId);
        if (job == null || job.EmployerId != employerId)
            return BadRequest("Không tìm thấy công việc này hoặc bạn không phải nhà tuyển dụng cho công việc này.");

        // Kiểm tra ứng viên đã có lịch phỏng vấn chưa
        var already = await _context.Interviews.AnyAsync(i =>
            i.JobId == dto.JobId && i.CandidateUserId == dto.CandidateUserId);
        if (already)
            return BadRequest("Ứng viên này đã có lịch phỏng vấn cho công việc này.");

        // Tạo lịch phỏng vấn mới
        var interview = new Interview
        {
            JobId = dto.JobId,
            EmployerId = employerId,
            CandidateUserId = dto.CandidateUserId,
            Message = dto.Message,  // Thông điệp từ nhà tuyển dụng
            Status = "pending", // Trạng thái phỏng vấn ban đầu
            CreatedAt = DateTime.UtcNow,
        };

        // Thêm vào bảng Interviews
        _context.Interviews.Add(interview);
        await _context.SaveChangesAsync();

        // Cập nhật trạng thái của ứng viên trong bảng Applications
        var application = await _context.Applications
            .FirstOrDefaultAsync(a => a.JobId == dto.JobId && a.UserId == dto.CandidateUserId);

        if (application != null)
        {
            application.Status = (int)ApplicationStatus.InvitedToInterview;
            await _context.SaveChangesAsync();
        }

        var candidate = await _context.Users.FindAsync(dto.CandidateUserId);
        if (candidate != null)
        {
            string subject = "Thông báo mời phỏng vấn";
            string body = $@"
            Chúc mừng! Bạn đã được mời tham gia phỏng vấn cho vị trí {job.Title}.
            <br><br><hr>
            Lịch hẹn phỏng vấn: {dto.Message}
            <br>
            Nhà tuyển dụng đã mời bạn phỏng vấn. Vui lòng xác nhận tham gia hoặc không tham gia cuộc phỏng vấn bằng cách nhấn vào một trong các liên kết dưới đây:
            <br><br>
            <a href='{Request.Scheme}://{Request.Host}/api/Interview/confirm?interviewId={interview.Id}&userId={dto.CandidateUserId}&response=accepted'> <button>Xác nhận tham gia phỏng vấn</button></a>
            <br>
            <a href='{Request.Scheme}://{Request.Host}/api/Interview/confirm?interviewId={interview.Id}&userId={dto.CandidateUserId}&response=rejected'> <button>Xác nhận tham không gia phỏng vấn</button></a>
            <br><br>
        ";

            _emailService.SendEmail(candidate.Email, subject, body);
        }

        return Ok(new { message = "Lịch phỏng vấn đã được tạo và thông báo qua email đã được gửi!" });
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


    [HttpGet("confirm")]
    public async Task<IActionResult> ConfirmInterview([FromQuery] int interviewId, [FromQuery] int userId, [FromQuery] string response)
    {
        // Kiểm tra sự tồn tại của cuộc phỏng vấn
        var interview = await _context.Interviews.FindAsync(interviewId);
        if (interview == null)
        {
            return NotFound("Lịch phỏng vấn không tồn tại.");
        }

        // Kiểm tra ứng viên tồn tại và có quyền tham gia
        var applicant = await _context.Users.FindAsync(userId);
        if (applicant == null)
        {
            return NotFound("Ứng viên không tồn tại.");
        }

        if (interview.CandidateUserId != userId)
        {
            return Unauthorized("Bạn không phải là ứng viên cho lịch phỏng vấn này.");
        }

        // Cập nhật trạng thái cuộc phỏng vấn dựa trên phản hồi từ ứng viên
        if (response.ToLower() == "accepted")
        {
            interview.Status = "accepted";  // Ứng viên xác nhận tham gia
        }
        else if (response.ToLower() == "declined")
        {
            interview.Status = "declined";
        }
        else
        {
            return BadRequest("Phản hồi không hợp lệ.");
        }

        await _context.SaveChangesAsync();

        return Ok(new { message = $"Bạn đã xác nhận {response} cuộc phỏng vấn thành công." });
    }


    [Authorize(Roles = "candidate")]
    [Authorize(Roles = "employer")]
    [HttpPut("reject/{id}")]
    public async Task<IActionResult> RejectApplication(int id, [FromBody] RejectApplicationDto dto)
    {
        var application = await _context.Applications.FindAsync(id);
        if (application == null) return NotFound("Không tìm thấy hồ sơ.");

        application.Status = (int)ApplicationStatus.Rejected;
        application.RejectReason = dto.RejectReason;

        await _context.SaveChangesAsync();

        return Ok(new { message = "Ứng viên đã bị từ chối." });
    }



    public class UpdateStatusRequest
    {
        public ApplicationStatus Status { get; set; }
    }
    public class RejectApplicationDto
    {
        public string? RejectReason { get; set; }
    }
    public class ScheduleInterviewDto
    {
        public int JobId { get; set; }
        public int CandidateUserId { get; set; }
        public required string Message { get; set; }
        public DateTime InterviewDate { get; set; }
    }


}
