using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BACKEND.Models;
using Microsoft.AspNetCore.Authorization;

[ApiController]
[Route("api/[controller]")]
public class ApplicationsController : ControllerBase
{
    private readonly TopcvBeContext _context;
    private readonly IWebHostEnvironment _env;
    private readonly IHttpContextAccessor _http;

    public ApplicationsController(TopcvBeContext context, IWebHostEnvironment env, IHttpContextAccessor http)
    {
        _context = context;
        _env = env;
        _http = http;
    }

    [Authorize(Roles = "jobseeker")]
    [HttpPost("apply")]
    public async Task<IActionResult> Apply([FromForm] int jobId, [FromForm] IFormFile cvFile)
    {
        var userIdClaim = _http.HttpContext?.User?.Claims?.FirstOrDefault(c => c.Type == "id");
        if (userIdClaim == null) return Unauthorized();
        int userId = int.Parse(userIdClaim.Value);

        var job = await _context.JobPosts.FindAsync(jobId);
        if (job == null) return NotFound("Không tìm thấy bài tuyển dụng.");

        var existed = await _context.Applications.AnyAsync(a => a.UserId == userId && a.JobId == jobId);
        if (existed) return BadRequest("Bạn đã ứng tuyển bài viết này rồi.");

        string? fileName = null;
        if (cvFile != null && cvFile.Length > 0)
        {
            var uploads = Path.Combine(_env.WebRootPath, "cv");
            if (!Directory.Exists(uploads)) Directory.CreateDirectory(uploads);

            fileName = $"{userId}_{jobId}_{DateTime.UtcNow.Ticks}{Path.GetExtension(cvFile.FileName)}";
            var filePath = Path.Combine(uploads, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await cvFile.CopyToAsync(stream);
            }
        }

        var app = new Application
        {
            JobId = jobId,
            UserId = userId,
            CvFile = fileName,
            AppliedAt = DateTime.UtcNow
        };

        _context.Applications.Add(app);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Ứng tuyển thành công!" });
    }
}

