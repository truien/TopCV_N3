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
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Apply([FromForm] ApplyRequest request)
    {
        var userIdClaim = _http.HttpContext?.User?.Claims?.FirstOrDefault(c => c.Type == "id");
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
        }

        var app = new Application
        {
            JobId = request.JobId,
            UserId = userId,
            CvFile = fileName,
            AppliedAt = DateTime.UtcNow
        };

        _context.Applications.Add(app);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Ứng tuyển thành công!" });
    }

}

