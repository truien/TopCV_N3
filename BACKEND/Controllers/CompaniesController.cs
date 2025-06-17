using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BACKEND.Models;

namespace BACKEND.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CompaniesController : ControllerBase
    {
        private readonly TopcvBeContext _context;
        public CompaniesController(TopcvBeContext context)
        {
            _context = context;
        }
        [HttpGet("{slug}")]
        public async Task<IActionResult> GetBySlug(string slug)
        {
            var company = await _context.CompanyProfiles
                .Where(c => c.Slug == slug)
                .Select(c => new
                {
                    c.UserId,
                    c.CompanyName,
                    c.Description,
                    c.Location,
                    c.Website,
                    Avatar = c.User.Avatar != null
                        ? (c.User.Avatar.StartsWith("http") ? c.User.Avatar : $"{Request.Scheme}://{Request.Host}/uploads/avatars/{c.User.Avatar}")
                        : null
                })
                .FirstOrDefaultAsync();

            if (company == null)
                return NotFound(new { message = "Không tìm thấy công ty." });

            return Ok(company);
        }
        [HttpGet("top-applied")]
        public async Task<IActionResult> GetTopAppliedCompanies(int top = 5)
        {
            var topCompanies = await _context.CompanyProfiles
                .Select(c => new
                {
                    c.UserId,
                    c.CompanyName,
                    c.Description,
                    c.Location,
                    c.Website,
                    Avatar = c.User.Avatar != null
                        ? (c.User.Avatar.StartsWith("http") ? c.User.Avatar : $"{Request.Scheme}://{Request.Host}/uploads/avatars/{c.User.Avatar}")
                        : null,
                    ApplicationCount = _context.Applications
                        .Where(a => a.Job.EmployerId == c.UserId)
                        .Count()
                })
                .OrderByDescending(c => c.ApplicationCount)
                .ThenBy(c => c.CompanyName)
                .Take(top)
                .ToListAsync();

            return Ok(topCompanies);
        }
        [HttpGet("featured")]
        public async Task<IActionResult> GetFeaturedCompanies([FromQuery] string? industry = null, [FromQuery] int page = 1, [FromQuery] int pageSize = 4)
        {
            var query = _context.CompanyProfiles
                .Include(c => c.User)
                .Select(c => new
                {
                    c.UserId,
                    c.CompanyName,
                    c.Description,
                    c.Location,
                    c.Website,
                    c.Slug,
                    Industry = _context.JobFields
                        .Where(f => _context.JobPostFields.Any(jpf => jpf.JobPost.EmployerId == c.UserId && jpf.FieldId == f.Id))
                        .Select(f => f.Name)
                        .FirstOrDefault(),
                    Avatar = c.User.Avatar != null
                        ? (c.User.Avatar.StartsWith("http") ? c.User.Avatar : $"{Request.Scheme}://{Request.Host}/uploads/avatars/{c.User.Avatar}")
                        : null,
                    JobCount = _context.JobPosts.Count(j => j.EmployerId == c.UserId && j.Status == "open"),
                    IsPro = _context.ProSubscriptions.Any(p => p.UserId == c.UserId),
                });

            if (!string.IsNullOrEmpty(industry) && industry != "Tất cả")
            {
                query = query.Where(c => c.Industry == industry);
            }

            var total = await query.CountAsync();
            var companies = await query
                .OrderByDescending(c => c.IsPro) // Ưu tiên Pro
                .ThenByDescending(c => c.JobCount)
                .ThenBy(c => c.CompanyName)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return Ok(new { total, companies });
        }
    }
}
