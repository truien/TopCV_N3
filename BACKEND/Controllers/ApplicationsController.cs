using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BACKEND.Models;
using Microsoft.AspNetCore.Authorization;
using BACKEND.Enums;
using System.Security.Claims;


[ApiController]
[Route("api/[controller]")]
public class ApplicationsController : ControllerBase
{
    private readonly TopcvBeContext _context;
    private readonly IWebHostEnvironment _env;
    private readonly IHttpContextAccessor _http;
    private readonly NotificationService _notificationService;

    public ApplicationsController(TopcvBeContext context, IWebHostEnvironment env, IHttpContextAccessor http, NotificationService notificationService)
    {
        _context = context;
        _env = env;
        _http = http;
        _notificationService = notificationService;
    }

    [Authorize(Roles = "candidate")]
    [HttpPost("apply")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Apply([FromForm] ApplyRequest request)
    {
        var userIdClaim = _http.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null) return Unauthorized();

        int userId = int.Parse(userIdClaim.Value);


        var job = await _context.JobPosts.FindAsync(request.JobId);
        if (job == null) return NotFound("Không tìm thấy bài tuyển dụng.");

        var existed = await _context.Applications.AnyAsync(a => a.UserId == userId && a.JobId == request.JobId);
        if (existed) return BadRequest("Bạn đã ứng tuyển bài viết này rồi.");

        string? fileName = null;
        if (request.CvFile != null && request.CvFile.Length > 0)
        {
            var uploads = Path.Combine(_env.WebRootPath, "cv");
            if (!Directory.Exists(uploads)) Directory.CreateDirectory(uploads);

            fileName = $"{userId}_{request.JobId}_{DateTime.UtcNow.Ticks}{Path.GetExtension(request.CvFile.FileName)}";
            var filePath = Path.Combine(uploads, fileName);

            using var stream = new FileStream(filePath, FileMode.Create);
            await request.CvFile.CopyToAsync(stream);
        }        var app = new Application
        {
            JobId = request.JobId,
            UserId = userId,
            CvFile = fileName,
            AppliedAt = DateTime.UtcNow,
            Status = (int)ApplicationStatus.Pending
        };

        _context.Applications.Add(app);
        await _context.SaveChangesAsync();        // Send notification to employer
        await _notificationService.CreateApplicationNotificationAsync(app.JobId, userId);

        return Ok(new { message = "Ứng tuyển thành công!" });
    }

    [Authorize(Roles = "employer")]
    [HttpGet("job/{jobId}")]
    public async Task<IActionResult> GetApplicationsByJob(int jobId)
    {
        var applications = await _context.Applications
            .Include(a => a.User)
            .Where(a => a.JobId == jobId)
            .ToListAsync();

        return Ok(applications);
    }    [Authorize(Roles = "employer")]
    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateApplicationStatus(int id, [FromBody] UpdateStatusRequest request)
    {
        var app = await _context.Applications
            .Include(a => a.Job)
            .Include(a => a.User)
            .FirstOrDefaultAsync(a => a.Id == id);
        
        if (app == null) return NotFound("Không tìm thấy hồ sơ.");
        
        var oldStatus = (ApplicationStatus)app.Status;
        app.Status = (int)request.Status;
        
        if (request.Status == ApplicationStatus.Rejected && !string.IsNullOrEmpty(request.RejectReason))
        {
            app.RejectReason = request.RejectReason;
        }
        
        await _context.SaveChangesAsync();        // Send notification to applicant about status change
        if (oldStatus != request.Status)
        {
            await _notificationService.CreateApplicationStatusNotificationAsync(app.Id, request.Status.ToString());
        }

        return Ok(new { message = "Cập nhật trạng thái thành công!" });
    }


    [Authorize(Roles = "employer")]
    [HttpGet("{id}")]
    public async Task<IActionResult> GetApplicationDetail(int id)
    {
        var app = await _context.Applications
            .Include(a => a.User)
            .Include(a => a.Job)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (app == null) return NotFound("Không tìm thấy hồ sơ.");

        return Ok(app);
    }

    [Authorize(Roles = "candidate")]
    [HttpGet("has-applied/{jobId}")]
    public async Task<IActionResult> HasApplied(int jobId)
    {
        var userIdClaim = _http.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null) return Unauthorized();
        int userId = int.Parse(userIdClaim.Value);


        var hasApplied = await _context.Applications
            .AnyAsync(a => a.JobId == jobId && a.UserId == userId);

        return Ok(new { hasApplied });
    }

    [Authorize(Roles = "employer")]
    [HttpGet("employer/all")]
    public async Task<IActionResult> GetAllApplicationsByEmployer()
    {
        var employerIdClaim = _http.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier);
        if (employerIdClaim == null) return Unauthorized();

        int employerId = int.Parse(employerIdClaim.Value);


#pragma warning disable CS8602
        var applications = await _context.Applications
            .Include(a => a.User)
                .ThenInclude(u => u.CandidateProfiles)
            .Include(a => a.Job)
            .Where(a => a.Job.EmployerId == employerId)
            .OrderByDescending(a => a.AppliedAt)
            .Select(a => new
            {
                a.Id,
                UserId = a.User.Id,
                JobId = a.Job.Id,
                FullName = a.User.CandidateProfiles.FirstOrDefault() != null
                    ? a.User.CandidateProfiles.FirstOrDefault().Fullname
                    : a.User.Username,
                Email = a.User.Email,
                a.AppliedAt,
                JobTitle = a.Job.Title,
                CvUrl = string.IsNullOrEmpty(a.CvFile) ? null : $"{Request.Scheme}://{Request.Host}/cv/{a.CvFile}",
                Status = a.Status.ToString(),
                a.RejectReason
            })
            .ToListAsync();
#pragma warning restore CS8602

        return Ok(applications);
    }


}

public class UpdateStatusRequest
{
    public ApplicationStatus Status { get; set; }
    public string? RejectReason { get; set; }
}
