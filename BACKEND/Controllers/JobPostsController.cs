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

#pragma warning disable CS8602
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

            // === PROMOTED JOBS ===
            var promotedQuery = from promo in _context.JobPostPromotions
                                join i in _context.JobPosts on promo.JobPostId equals i.Id
                                join e in _context.CompanyProfiles on i.EmployerId equals e.UserId
                                join u in _context.Users on e.UserId equals u.Id
                                join f in _context.JobPostFields on i.Id equals f.JobPostId
                                join em in _context.JobPostEmploymentTypes on i.Id equals em.JobPostId
                                where i.Id != excludeId
                                      && i.Status == "open"
                                      && i.ApplyDeadline >= now
                                      && promo.StartDate <= now && promo.EndDate >= now
                                let score =
                                    (f.Field.Name == fiels ? 1 : 0) +
                                    (em.EmploymentType.Name == employment ? 1 : 0) +
                                    (string.IsNullOrEmpty(location) || i.Location.Contains(location) ? 1 : 0)
                                orderby score descending, i.PostDate descending
                                select new RelatedJobPostDto
                                {
                                    Id = i.Id,
                                    Title = i.Title,
                                    CompanyName = e.CompanyName,
                                    Avatar = string.IsNullOrEmpty(u.Avatar)
                                        ? null
                                        : (u.Avatar.StartsWith("http") ? u.Avatar : baseUrl + "/avatar/" + u.Avatar),
                                    Location = i.Location,
                                    ApplyDeadline = i.ApplyDeadline,
                                    PostDate = i.PostDate,
                                    SalaryRange = i.SalaryRange,
                                    RelevanceScore = score
                                };

            var promotedJobs = await promotedQuery.Take(limitted).ToListAsync();
            int remaining = limitted - promotedJobs.Count;

            // === NORMAL JOBS ===
            var normalJobs = new List<RelatedJobPostDto>();
            if (remaining > 0)
            {
                var normalQuery = from i in _context.JobPosts
                                  join e in _context.CompanyProfiles on i.EmployerId equals e.UserId
                                  join u in _context.Users on e.UserId equals u.Id
                                  join f in _context.JobPostFields on i.Id equals f.JobPostId
                                  join em in _context.JobPostEmploymentTypes on i.Id equals em.JobPostId
                                  where i.Id != excludeId
                                        && i.Status == "open"
                                        && i.ApplyDeadline >= now
                                        && !_context.JobPostPromotions
                                            .Any(p => p.JobPostId == i.Id && p.StartDate <= now && p.EndDate >= now)

                                  let score =
                                      (f.Field.Name == fiels ? 1 : 0) +
                                      (em.EmploymentType.Name == employment ? 1 : 0) +
                                      (string.IsNullOrEmpty(location) || i.Location.Contains(location) ? 1 : 0)
                                  orderby score descending, i.PostDate descending
                                  select new RelatedJobPostDto
                                  {
                                      Id = i.Id,
                                      Title = i.Title,
                                      CompanyName = e.CompanyName,
                                      Avatar = string.IsNullOrEmpty(u.Avatar)
                                          ? null
                                          : (u.Avatar.StartsWith("http") ? u.Avatar : baseUrl + "/avatar/" + u.Avatar),
                                      Location = i.Location,
                                      ApplyDeadline = i.ApplyDeadline,
                                      PostDate = i.PostDate,
                                      SalaryRange = i.SalaryRange,
                                      RelevanceScore = score
                                  };

                normalJobs = await normalQuery.Take(remaining).ToListAsync();
            }

            // Combine promoted and normal jobs, ensuring no duplicates by JobPost Id
            var combinedJobs = promotedJobs.Concat(normalJobs).ToList();

            // Check if we need to add more jobs to reach the desired limit
            if (combinedJobs.Count < limitted)
            {
                // Get additional promoted jobs (instead of normal jobs) to fill up the remaining slots
                var additionalPromotedQuery = from promo in _context.JobPostPromotions
                                              join i in _context.JobPosts on promo.JobPostId equals i.Id
                                              join e in _context.CompanyProfiles on i.EmployerId equals e.UserId
                                              join u in _context.Users on e.UserId equals u.Id
                                              where i.Id != excludeId
                                                    && i.Status == "open"
                                                    && i.ApplyDeadline >= now
                                                    && promo.StartDate <= now && promo.EndDate >= now
                                              select new RelatedJobPostDto
                                              {
                                                  Id = i.Id,
                                                  Title = i.Title,
                                                  CompanyName = e.CompanyName,
                                                  Avatar = string.IsNullOrEmpty(u.Avatar)
                                                      ? null
                                                      : (u.Avatar.StartsWith("http") ? u.Avatar : baseUrl + "/avatar/" + u.Avatar),
                                                  Location = i.Location,
                                                  ApplyDeadline = i.ApplyDeadline,
                                                  PostDate = i.PostDate,
                                                  SalaryRange = i.SalaryRange,
                                                  RelevanceScore = 0  // You can set a default score or remove it based on your logic
                                              };

                // Get enough additional promoted jobs to meet the limit
                var additionalPromotedJobs = await additionalPromotedQuery.Take(limitted - combinedJobs.Count).ToListAsync();

                // Add additional promoted jobs to the list
                combinedJobs.AddRange(additionalPromotedJobs);
            }

            // Remove duplicates by Id
            var result = combinedJobs.GroupBy(job => job.Id)
                                     .Select(group => group.First())
                                     .ToList();

            return Ok(result);
        }
#pragma warning restore CS8602




    }
}