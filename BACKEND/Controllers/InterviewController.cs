using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using BACKEND.Models;
using BACKEND.Enums;
using System.Security.Claims;
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
        var employerIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (employerIdClaim == null)
            return Unauthorized();
        int employerId = int.Parse(employerIdClaim.Value);

        var application = await _context.Applications
            .Include(a => a.Job)
            .Include(a => a.User)
            .FirstOrDefaultAsync(a => a.Id == dto.ApplicationId);
        if (application == null)
            return BadRequest("Hồ sơ ứng tuyển không tồn tại.");
        if (application.Job.EmployerId != employerId)
            return Forbid("Bạn không có quyền lên lịch phỏng vấn cho hồ sơ này.");

        var token = Guid.NewGuid().ToString("N");
        var interview = new Interview
        {
            ApplicationId = dto.ApplicationId,
            Message = dto.Message,
            CreatedAt = dto.InterviewDate,
            SecureToken = token,
            Status = "pending"
        };
        _context.Interviews.Add(interview);

        // 4. Cập nhật trạng thái application
        application.Status = (int)ApplicationStatus.InvitedToInterview;

        await _context.SaveChangesAsync();

        // Lấy URL API từ config
        var apiBase = _config["BackEndApiUrl"];  

        // Tạo link đến API confirm
        var acceptLink = $"{apiBase}/api/interview/confirm/{token}/accepted";
        var declineLink = $"{apiBase}/api/interview/confirm/{token}/declined";

        var htmlBody = $@"
        <p>Chào <strong>{application.User.Username}</strong>,</p>
        <p>Bạn được mời phỏng vấn cho <em>{application.Job.Title}</em>.</p>
        <p>Nội dung: {dto.Message}</p>
        <p>Vui lòng bấm một trong hai nút bên dưới để phản hồi:</p>
        <p>
        <a href=""{acceptLink}"" style=""display:inline-block;padding:10px 20px;
            background-color:#28a745;color:#fff;text-decoration:none;
            border-radius:4px;margin-right:10px;"">Xác nhận</a>
        <a href=""{declineLink}"" style=""display:inline-block;padding:10px 20px;
            background-color:#dc3545;color:#fff;text-decoration:none;
            border-radius:4px;"">Từ chối</a>
        </p>
    ";

        _emailService.SendEmail(
            application.User.Email,
            "Lời mời phỏng vấn – Vui lòng xác nhận",
            htmlBody
        );

        return Ok(new { message = "Lịch phỏng vấn đã tạo và email xác nhận đã gửi." });
    }
    private string GenerateToken()
    {
        var token = Guid.NewGuid().ToString();
        return token;
    }

    [Authorize(Roles = "employer")]
    [HttpGet("employer/all")]
    public async Task<IActionResult> GetAllForEmployer()
    {
        var employerIdClaim = _http.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier);
        if (employerIdClaim == null) return Unauthorized();
        int employerId = int.Parse(employerIdClaim.Value);

        var interviews = await (
        from i in _context.Interviews
        join a in _context.Applications on i.ApplicationId equals a.Id
        join u in _context.Users on a.UserId equals u.Id
        // Left‐join CandidateProfiles để không bỏ qua ai chưa có profile
        join pgroup in _context.CandidateProfiles
            on u.Id equals pgroup.UserId into cpGroup
        from p in cpGroup.DefaultIfEmpty()    // p có thể null
        join j in _context.JobPosts on a.JobId equals j.Id
        where j.EmployerId == employerId
        orderby i.CreatedAt descending
        select new
        {
            i.Id,
            CandidateName = p != null
                ? p.Fullname
                : "(Chưa cập nhật tên)",
            Email = u.Email,
            JobTitle = j.Title,
            i.Status,
            i.CreatedAt
        }
    ).ToListAsync();

        return Ok(interviews);
    }

    [Authorize(Roles = "employer")]
    [HttpGet("employer/active")]
    public async Task<IActionResult> GetActiveJobPosts()
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdStr))
            return Unauthorized();

        int employerId = int.Parse(userIdStr);
        var jobs = await _context.JobPosts
            .Where(j => j.EmployerId == employerId && j.Status == "open")
            .Select(j => new { j.Id, j.Title })
            .ToListAsync();

        return Ok(jobs);
    }
    [AllowAnonymous]
    [HttpGet("confirm/{secureToken}/{response}")]
    public async Task<IActionResult> ConfirmByToken(string secureToken, string response)
    {
        var interview = await _context.Interviews
            .FirstOrDefaultAsync(i => i.SecureToken == secureToken);

        if (interview == null
            || interview.Status != "pending"
            || (response != "accepted" && response != "declined"))
        {
            return Redirect($"{_config["FrontEndBaseUrl"]}/confirm?status=error");
        }

        // update
        interview.Status = response;
        interview.SecureToken = null;
        await _context.SaveChangesAsync();
        return Redirect($"{_config["FrontEndBaseUrl"]}/confirm?status={response}");
    }


    [Authorize(Roles = "candidate")]
    [Authorize(Roles = "employer")]
    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateInterviewStatus(int id, [FromBody] string status)
    {
        var interview = await _context.Interviews.FindAsync(id);
        if (interview == null)
            return NotFound("Không tìm thấy lịch phỏng vấn.");
        if (status is not ("pending" or "accepted" or "declined"))
            return BadRequest("Trạng thái không hợp lệ.");

        interview.Status = status;
        await _context.SaveChangesAsync();
        return Ok(new { message = "Cập nhật trạng thái thành công." });
    }

    [Authorize(Roles = "candidate")]
    [HttpGet("candidate/received")]
    public async Task<IActionResult> GetCandidateInterviews()
    {
        var userIdStr = _http.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdStr == null) return Unauthorized();
        int userId = int.Parse(userIdStr.Value);

        var interviews = await _context.Interviews
            .Include(i => i.Application)
                .ThenInclude(a => a.Job)
            .Where(i => i.Application.UserId == userId)
            .OrderByDescending(i => i.CreatedAt)
            .Select(i => new
            {
                i.Id,
                JobTitle = i.Application.Job.Title,
                i.Status,
                i.Message,
                i.CreatedAt
            })
            .ToListAsync();

        return Ok(interviews);
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
        public int ApplicationId { get; set; }
        public required string Message { get; set; }
        public DateTime InterviewDate { get; set; } = DateTime.Now;
    }



}
