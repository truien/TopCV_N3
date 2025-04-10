using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BACKEND.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.VisualBasic;

namespace BACKEND.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class JobPostsController : ControllerBase
    {
        private readonly TopcvBeContext _context;

        public JobPostsController(TopcvBeContext context)
        {
            _context = context;
        }

        [HttpGet("promoted")]
        public async Task<IActionResult> GetPromotedJobs(string location = "", int page = 1, int pageSize = 12)
        {
            var now = DateTime.UtcNow;
            int skip = (page - 1) * pageSize;
            var baseUrl = $"{Request.Scheme}://{Request.Host}/";

            var query = from promo in _context.JobPostPromotions
                        join job in _context.JobPosts on promo.JobPostId equals job.Id
                        join user in _context.Users on job.EmployerId equals user.Id
                        join company in _context.CompanyProfiles on user.Id equals company.UserId
                        where promo.StartDate <= now && promo.EndDate >= now
                            && job.Status == "open"
                        select new
                        {
                            Id = job.Id,
                            Avatar = string.IsNullOrEmpty(user.Avatar) ? null : baseUrl + user.Avatar,
                            Company = company.CompanyName,
                            JobTitle = job.Title,
                            Salary = job.SalaryRange,
                            Location = job.Location
                        };

            // Lọc theo location
            if (!string.IsNullOrEmpty(location))
            {
                if (location == "Miền Bắc")
                {
                    query = query.Where(x => x.Location.Contains("Hà Nội") || x.Location.Contains("Hải Dương") || x.Location.Contains("Hải Phòng"));
                }
                else if (location == "Miền Nam")
                {
                    query = query.Where(x => x.Location.Contains("TP.HCM") || x.Location.Contains("Long An") || x.Location.Contains("Nha Trang"));
                }
                else
                {
                    query = query.Where(x => x.Location.Contains(location));
                }
            }

            // Phân trang
            var jobs = await query
                .Skip(skip)
                .Take(pageSize)
                .ToListAsync();

            var totalJobs = await query.CountAsync();
            var totalPages = (int)Math.Ceiling((double)totalJobs / pageSize);

            return Ok(new
            {
                Jobs = jobs,
                TotalPages = totalPages,
                CurrentPage = page
            });
        }
        [HttpGet("{id}")]
        public async Task<IActionResult> GetJobPostDetails(int id)
        {
            var baseUrl = $"{Request.Scheme}://{Request.Host}/";

            var job = await _context.JobPosts
                .Include(j => j.Employer)
                    .ThenInclude(e => e.CompanyProfiles)
                .Include(j => j.Employer)
                    .ThenInclude(e => e.Role)
                .FirstOrDefaultAsync(j => j.Id == id && j.Status == "open");

            if (job == null)
            {
                return NotFound(new { message = "Bài đăng không tồn tại" });
            }

            // Lấy field
            var fields = await _context.JobPostFields
                .Where(x => x.JobPostId == id)
                .Select(x => x.Field!.Name)
                .ToListAsync();

            // Lấy employment type
            var employmentTypes = await _context.JobPostEmploymentTypes
                .Where(x => x.JobPostId == id)
                .Select(x => x.EmploymentType!.Name)
                .ToListAsync();

            var result = new
            {
                job.Id,
                job.Title,
                JobDescription = job.Description,
                job.Requirements,
                job.SalaryRange,
                job.Location,
                job.PostDate,
                job.Interest,
                job.ApplyDeadline,
                job.JobOpeningCount,
                Employer = new
                {
                    CompanyName = job.Employer.CompanyProfiles.FirstOrDefault()?.CompanyName,
                    Avatar = string.IsNullOrEmpty(job.Employer.Avatar) ? null : baseUrl + job.Employer.Avatar
                },
                Fields = fields,
                Employment = employmentTypes
            };

            return Ok(result);
        }



    }
}