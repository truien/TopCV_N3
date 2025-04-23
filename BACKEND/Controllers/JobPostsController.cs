using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BACKEND.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.VisualBasic;
using System.Security.Claims;

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
                            Avatar = string.IsNullOrEmpty(user.Avatar)
                                    ? null
                                    : (user.Avatar.StartsWith("http") ? user.Avatar : baseUrl + "avatar/" + user.Avatar),

                            Company = company.CompanyName,
                            JobTitle = job.Title,
                            Salary = job.SalaryRange,
                            Location = job.Location
                        };

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

            var fields = await _context.JobPostFields
                .Where(x => x.JobPostId == id)
                .Select(x => x.Field!.Name)
                .ToListAsync();

            var employmentTypes = await _context.JobPostEmploymentTypes
                .Where(x => x.JobPostId == id)
                .Select(x => x.EmploymentType!.Name)
                .ToListAsync();

            var followerCount = await _context.UserFollows
                                .Where(uf => uf.EmployerId == job.EmployerId)
                                .CountAsync();

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
                job.EmployerId,
                Employer = new
                {
                    CompanyName = job.Employer.CompanyProfiles.FirstOrDefault()?.CompanyName,
                    Avatar = string.IsNullOrEmpty(job.Employer.Avatar)
                            ? null
                            : (job.Employer.Avatar.StartsWith("http")
                            ? job.Employer.Avatar
                            : baseUrl + job.Employer.Avatar),
                    Follower = followerCount
                },
                Fields = fields,
                Employment = employmentTypes
            };

            return Ok(result);
        }

        [HttpGet("get-jobpost-by-id/{employerId}")]
        public async Task<IActionResult> GetJobPostByEmployerId(int employerId, [FromQuery] int excludeId = 0)
        {
            var baseUrl = $"{Request.Scheme}://{Request.Host}";

            var query = from i in _context.JobPosts
                        join e in _context.CompanyProfiles on i.EmployerId equals e.UserId
                        join u in _context.Users on i.EmployerId equals u.Id
                        where i.EmployerId == employerId && i.Id != excludeId && i.Status == "open"
                        && (i.ApplyDeadline == null || i.ApplyDeadline >= DateTime.UtcNow)
                        orderby i.PostDate descending
                        select new
                        {
                            id = i.Id,
                            title = i.Title,
                            companyName = e.CompanyName,
                            avatar = string.IsNullOrEmpty(u.Avatar)
                                            ? null
                                            : (u.Avatar.StartsWith("http") ? u.Avatar : baseUrl + u.Avatar),
                            location = i.Location,
                            applyDeadline = i.ApplyDeadline,
                            postDate = i.PostDate,
                            salaryRange = i.SalaryRange
                        };

            var jobs = await query.Take(10).ToListAsync();
            return Ok(jobs);
        }

        [HttpGet("related")]
        public async Task<IActionResult> GetRelatedJobPosts(
            [FromQuery] string? fiels,
            [FromQuery] string? location,
            [FromQuery] string? employment,
            [FromQuery] int excludeId,
            [FromQuery] int limitted = 10)
        {
            var baseUrl = $"{Request.Scheme}://{Request.Host}";
            var now = DateTime.UtcNow;

            var query = _context.JobPosts
                .Include(j => j.Employer)
                    .ThenInclude(e => e.CompanyProfiles)
                .Include(j => j.JobPostFields)
                    .ThenInclude(f => f.Field)
                .Include(j => j.JobPostEmploymentTypes)
                    .ThenInclude(em => em.EmploymentType)
                .Where(j => j.Id != excludeId && j.Status == "open" && j.ApplyDeadline >= now);

            var jobs = await query
                .Select(j => new
                {
                    j.Id,
                    j.Title,
                    j.Location,
                    j.ApplyDeadline,
                    j.PostDate,
                    j.SalaryRange,
                    CompanyName = j.Employer.CompanyProfiles.FirstOrDefault()!.CompanyName,
                    Avatar = string.IsNullOrEmpty(j.Employer.Avatar) ? null :
                            (j.Employer.Avatar.StartsWith("http") ? j.Employer.Avatar : baseUrl + "/avatar/" + j.Employer.Avatar),
                    Score =
                    (j.JobPostFields.Any(f => f.Field!.Name == fiels) ? 1 : 0) +
                    (j.JobPostEmploymentTypes.Any(em => em.EmploymentType!.Name == employment) ? 1 : 0) +
                    ((!string.IsNullOrEmpty(location) && !string.IsNullOrEmpty(j.Location) && j.Location.Contains(location)) ? 1 : 0)

                })
                .OrderByDescending(j => j.Score)
                .ThenByDescending(j => j.PostDate)
                .Take(limitted)
                .ToListAsync();

            return Ok(jobs);
        }

        [Authorize(Roles = "employer")]
        [HttpPost("create")]
        public async Task<IActionResult> CreateJobPost([FromBody] CreateJobPostDto dto)
        {
            var userIdClaim = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized();

            int employerId = int.Parse(userIdClaim.Value);


            var jobPost = new JobPost
            {
                Title = dto.Title,
                Description = dto.Description,
                Requirements = dto.Requirements,
                Interest = dto.Interest,
                SalaryRange = dto.SalaryRange,
                Location = dto.Location,
                ApplyDeadline = dto.ApplyDeadline,
                PostDate = DateTime.UtcNow,
                Status = "open",
                JobOpeningCount = dto.JobOpeningCount,
                ViewCount = 0,
                EmployerId = employerId
            };

            _context.JobPosts.Add(jobPost);
            await _context.SaveChangesAsync();

            // Gán ngành nghề
            foreach (var fieldId in dto.JobFieldIds)
            {
                _context.JobPostFields.Add(new JobPostField
                {
                    JobPostId = jobPost.Id,
                    FieldId = fieldId
                });
            }

            // Gán hình thức làm việc
            foreach (var typeId in dto.EmploymentTypeIds)
            {
                _context.JobPostEmploymentTypes.Add(new JobPostEmploymentType
                {
                    JobPostId = jobPost.Id,
                    EmploymentTypeId = typeId
                });
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Tạo bài viết thành công!", jobId = jobPost.Id });
        }




    }
}