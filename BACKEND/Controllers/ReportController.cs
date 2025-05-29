using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BACKEND.Models;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using System;


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
        var userIdStr = _http.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdStr))
            return Unauthorized("Không xác định người dùng.");

        int userId = int.Parse(userIdStr);


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
        await _context.SaveChangesAsync(); return Ok(new { message = "Đã gửi báo cáo bài viết." });
    }

    // Admin APIs
    [Authorize(Roles = "admin")]
    [HttpGet("admin/all")]
    public async Task<IActionResult> GetAllReports(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? status = null,
        [FromQuery] string? reason = null,
        [FromQuery] string? search = null)
    {
        var query = _context.JobPostReports
            .Include(r => r.JobPost)
                .ThenInclude(jp => jp.Employer)
            .Include(r => r.ReportedByNavigation)
            .AsQueryable();

        // Filters
        if (!string.IsNullOrEmpty(status))
        {
            query = query.Where(r => r.Status == status);
        }

        if (!string.IsNullOrEmpty(reason))
        {
            query = query.Where(r => r.Reason == reason);
        }
        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(r =>
                (r.JobPost != null && r.JobPost.Title != null && r.JobPost.Title.Contains(search)) ||
                (r.Description != null && r.Description.Contains(search)) ||
                (r.ReportedByNavigation != null && r.ReportedByNavigation.Email != null && r.ReportedByNavigation.Email.Contains(search)));
        }

        var totalCount = await query.CountAsync();
        var reports = await query
            .OrderByDescending(r => r.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(r => new
            {
                r.Id,
                r.JobPostId,
                JobPostTitle = r.JobPost.Title,
                CompanyName = r.JobPost.Employer.Email,
                ReportedByEmail = r.ReportedByNavigation.Email,
                r.Reason,
                r.Description,
                r.Status,
                r.CreatedAt
            })
            .ToListAsync();

        return Ok(new
        {
            data = reports,
            totalCount,
            currentPage = page,
            pageSize,
            totalPages = (int)Math.Ceiling((double)totalCount / pageSize)
        });
    }

    [Authorize(Roles = "admin")]
    [HttpGet("admin/statistics")]
    public async Task<IActionResult> GetReportStatistics()
    {
        var today = DateTime.UtcNow.Date;
        var tomorrow = today.AddDays(1);

        var totalReports = await _context.JobPostReports.CountAsync();

        var pendingReports = await _context.JobPostReports.CountAsync(r => r.Status == "pending");
        var resolvedReports = await _context.JobPostReports.CountAsync(r => r.Status == "resolved");
        var rejectedReports = await _context.JobPostReports.CountAsync(r => r.Status == "rejected");

        var todayReports = await _context.JobPostReports
            .CountAsync(r => r.CreatedAt >= today && r.CreatedAt < tomorrow);
        var reasonStats = await _context.JobPostReports
            .GroupBy(r => r.Reason)
            .Select(g => new
            {
                Reason = g.Key,
                Count = g.Count()
            })
            .ToListAsync();
        return Ok(new
        {
            totalReports,
            pendingReports,
            resolvedReports,
            rejectedReports,
            todayReports,
            reasonStats
        });
    }

    [Authorize(Roles = "admin")]
    [HttpPut("admin/{id}/status")]
    public async Task<IActionResult> UpdateReportStatus(int id, [FromBody] UpdateReportStatusDto dto)
    {
        var report = await _context.JobPostReports.FindAsync(id);
        if (report == null)
            return NotFound("Không tìm thấy báo cáo.");

        report.Status = dto.Status;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Đã cập nhật trạng thái báo cáo." });
    }

    [Authorize(Roles = "admin")]
    [HttpDelete("admin/{id}")]
    public async Task<IActionResult> DeleteReport(int id)
    {
        var report = await _context.JobPostReports.FindAsync(id);
        if (report == null)
            return NotFound("Không tìm thấy báo cáo.");

        _context.JobPostReports.Remove(report);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Đã xóa báo cáo thành công." });
    }

    [Authorize(Roles = "admin")]
    [HttpGet("admin/{id}")]
    public async Task<IActionResult> GetReportDetail(int id)
    {
        var report = await _context.JobPostReports
            .Include(r => r.JobPost)
                .ThenInclude(jp => jp.Employer)
            .Include(r => r.ReportedByNavigation)
            .Where(r => r.Id == id)
            .Select(r => new
            {
                r.Id,
                r.JobPostId,
                JobPost = new
                {
                    r.JobPost.Title,
                    r.JobPost.Description,
                    r.JobPost.PostDate,
                    Company = r.JobPost.Employer.Email
                },
                ReportedBy = new
                {
                    r.ReportedByNavigation.Email,
                    r.ReportedByNavigation.Username
                },
                r.Reason,
                r.Description,
                r.Status,
                r.CreatedAt
            })
            .FirstOrDefaultAsync();

        if (report == null)
            return NotFound("Không tìm thấy báo cáo.");

        return Ok(report);
    }
}
