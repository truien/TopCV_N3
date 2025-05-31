using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BACKEND.Models;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using BACKEND.DTOs;

namespace BACKEND.Controllers
{
    [Route("api/admin/[controller]")]
    [ApiController]
    [Authorize(Roles = "admin")]
    public class AdminJobPostsController : ControllerBase
    {
        private readonly TopcvBeContext _context;

        public AdminJobPostsController(TopcvBeContext context)
        {
            _context = context;
        }

        // GET: api/admin/AdminJobPosts - Lấy danh sách tất cả job posts với phân trang và tìm kiếm
        [HttpGet]
        public async Task<ActionResult> GetJobPosts(
            string? search = null,
            string? status = null,
            string? employerId = null,
            string? fieldId = null,
            DateTime? fromDate = null,
            DateTime? toDate = null,
            string? sortBy = "PostDate",
            string? sortDirection = "desc",
            int page = 1,
            int pageSize = 10)
        {
            try
            {
                var baseUrl = $"{Request.Scheme}://{Request.Host}/";

                var query = from job in _context.JobPosts
                            join user in _context.Users on job.EmployerId equals user.Id
                            join companyProfile in _context.CompanyProfiles on user.Id equals companyProfile.UserId into companyGroup
                            from cp in companyGroup.DefaultIfEmpty()
                            select new
                            {
                                job.Id,
                                job.Title,
                                job.Description,
                                job.Requirements,
                                job.Interest,
                                job.SalaryRange,
                                job.Location,
                                job.PostDate,
                                job.Status,
                                job.EmployerId,
                                job.ViewCount,
                                job.JobOpeningCount,
                                job.ApplyDeadline,
                                job.HighlightType,
                                job.PriorityLevel,
                                job.IsAutoBoost,
                                EmployerName = user.Username,
                                EmployerEmail = user.Email,
                                CompanyName = cp != null ? cp.CompanyName : user.Username,
                                CompanyLogo = string.IsNullOrEmpty(user.Avatar)
                                    ? null
                                    : (user.Avatar.StartsWith("http") ? user.Avatar : baseUrl + "avatar/" + user.Avatar),
                                ApplicationCount = job.Applications.Count()
                            };

                // Apply filters
                if (!string.IsNullOrEmpty(search))
                {
                    query = query.Where(j => j.Title.Contains(search) ||
                                           j.CompanyName.Contains(search) ||
                                           j.EmployerName.Contains(search) ||
                                           j.Description.Contains(search));
                }

                if (!string.IsNullOrEmpty(status))
                {
                    query = query.Where(j => j.Status == status);
                }

                if (!string.IsNullOrEmpty(employerId) && int.TryParse(employerId, out int empId))
                {
                    query = query.Where(j => j.EmployerId == empId);
                }

                if (fromDate.HasValue)
                {
                    query = query.Where(j => j.PostDate >= fromDate.Value);
                }

                if (toDate.HasValue)
                {
                    query = query.Where(j => j.PostDate <= toDate.Value.AddDays(1));
                }

                // Apply sorting
                query = sortBy?.ToLower() switch
                {
                    "title" => sortDirection == "asc" ? query.OrderBy(j => j.Title) : query.OrderByDescending(j => j.Title),
                    "companyname" => sortDirection == "asc" ? query.OrderBy(j => j.CompanyName) : query.OrderByDescending(j => j.CompanyName),
                    "status" => sortDirection == "asc" ? query.OrderBy(j => j.Status) : query.OrderByDescending(j => j.Status),
                    "viewcount" => sortDirection == "asc" ? query.OrderBy(j => j.ViewCount) : query.OrderByDescending(j => j.ViewCount),
                    "applicationcount" => sortDirection == "asc" ? query.OrderBy(j => j.ApplicationCount) : query.OrderByDescending(j => j.ApplicationCount),
                    _ => sortDirection == "asc" ? query.OrderBy(j => j.PostDate) : query.OrderByDescending(j => j.PostDate)
                };

                var totalItems = await query.CountAsync();
                var totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);

                var jobPosts = await query
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                // Get additional data for each job post
                var jobPostIds = jobPosts.Select(j => j.Id).ToList();

                // Get job fields
                var jobFields = await _context.JobPostFields
                    .Where(jpf => jobPostIds.Contains(jpf.JobPostId))
                    .Include(jpf => jpf.Field)
                    .GroupBy(jpf => jpf.JobPostId)
                    .ToDictionaryAsync(
                        g => g.Key,
                        g => g.Select(jpf => new { jpf.Field.Id, jpf.Field.Name }).ToList()
                    );

                // Get employment types
                var employmentTypes = await _context.JobPostEmploymentTypes
                    .Where(jpet => jobPostIds.Contains(jpet.JobPostId))
                    .Include(jpet => jpet.EmploymentType)
                    .GroupBy(jpet => jpet.JobPostId)
                    .ToDictionaryAsync(
                        g => g.Key,
                        g => g.Select(jpet => new { jpet.EmploymentType.Id, jpet.EmploymentType.Name }).ToList()
                    );

                var result = jobPosts.Select(job => new
                {
                    job.Id,
                    job.Title,
                    job.Description,
                    job.Requirements,
                    job.Interest,
                    job.SalaryRange,
                    job.Location,
                    job.PostDate,
                    job.Status,
                    job.EmployerId,
                    job.ViewCount,
                    job.JobOpeningCount,
                    job.ApplyDeadline,
                    job.HighlightType,
                    job.PriorityLevel,
                    job.IsAutoBoost,
                    job.EmployerName,
                    job.EmployerEmail,
                    job.CompanyName,
                    job.CompanyLogo,
                    job.ApplicationCount,
                    JobFields = jobFields.ContainsKey(job.Id) ? jobFields[job.Id].Cast<object>().ToList() : new List<object>(),
                    EmploymentTypes = employmentTypes.ContainsKey(job.Id) ? employmentTypes[job.Id].Cast<object>().ToList() : new List<object>()
                }).ToList();

                return Ok(new
                {
                    JobPosts = result,
                    CurrentPage = page,
                    TotalPages = totalPages,
                    TotalItems = totalItems,
                    PageSize = pageSize
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi server: " + ex.Message });
            }
        }

        // GET: api/admin/AdminJobPosts/{id} - Lấy chi tiết một job post
        [HttpGet("{id}")]
        public async Task<ActionResult> GetJobPost(int id)
        {
            try
            {
                var baseUrl = $"{Request.Scheme}://{Request.Host}/";

                var jobPost = await _context.JobPosts
                    .Include(j => j.Employer)
                    .Include(j => j.Applications)
                    .Include(j => j.JobPostFields).ThenInclude(jpf => jpf.Field)
                    .Include(j => j.JobPostEmploymentTypes).ThenInclude(jpet => jpet.EmploymentType)
                    .Include(j => j.JobPostReports)
                    .Where(j => j.Id == id)
                    .Select(j => new
                    {
                        j.Id,
                        j.Title,
                        j.Description,
                        j.Requirements,
                        j.Interest,
                        j.SalaryRange,
                        j.Location,
                        j.PostDate,
                        j.Status,
                        j.EmployerId,
                        j.ViewCount,
                        j.JobOpeningCount,
                        j.ApplyDeadline,
                        j.HighlightType,
                        j.PriorityLevel,
                        j.IsAutoBoost,
                        Employer = new
                        {
                            j.Employer.Id,
                            j.Employer.Username,
                            j.Employer.Email,
                            j.Employer.Avatar
                        },
                        CompanyProfile = _context.CompanyProfiles
                            .Where(cp => cp.UserId == j.EmployerId)
                            .Select(cp => new
                            {
                                cp.CompanyName,
                                cp.Website,
                                cp.Description
                            })
                            .FirstOrDefault(),
                        JobFields = j.JobPostFields.Select(jpf => new
                        {
                            jpf.Field.Id,
                            jpf.Field.Name
                        }).ToList(),
                        EmploymentTypes = j.JobPostEmploymentTypes.Select(jpet => new
                        {
                            jpet.EmploymentType.Id,
                            jpet.EmploymentType.Name
                        }).ToList(),
                        ApplicationCount = j.Applications.Count(),
                        ReportCount = j.JobPostReports.Count(),
                    })
                    .FirstOrDefaultAsync();

                if (jobPost == null)
                {
                    return NotFound(new { message = "Không tìm thấy bài đăng" });
                }

                return Ok(jobPost);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi server: " + ex.Message });
            }
        }

        // PUT: api/admin/AdminJobPosts/{id} - Cập nhật job post
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateJobPost(int id, [FromBody] UpdateJobPostDto updateDto)
        {
            try
            {
                var jobPost = await _context.JobPosts.FindAsync(id);
                if (jobPost == null)
                {
                    return NotFound(new { message = "Không tìm thấy bài đăng" });
                }

                // Update basic info
                if (!string.IsNullOrEmpty(updateDto.Title))
                    jobPost.Title = updateDto.Title;

                if (!string.IsNullOrEmpty(updateDto.Description))
                    jobPost.Description = updateDto.Description;

                if (!string.IsNullOrEmpty(updateDto.Requirements))
                    jobPost.Requirements = updateDto.Requirements;

                if (!string.IsNullOrEmpty(updateDto.Interest))
                    jobPost.Interest = updateDto.Interest;

                if (!string.IsNullOrEmpty(updateDto.SalaryRange))
                    jobPost.SalaryRange = updateDto.SalaryRange;
                if (!string.IsNullOrEmpty(updateDto.Location))
                    jobPost.Location = updateDto.Location;

                if (updateDto.JobOpeningCount.HasValue)
                    jobPost.JobOpeningCount = updateDto.JobOpeningCount;

                if (updateDto.ApplyDeadline.HasValue)
                    jobPost.ApplyDeadline = updateDto.ApplyDeadline;

                await _context.SaveChangesAsync();

                return Ok(new { message = "Cập nhật bài đăng thành công" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi server: " + ex.Message });
            }
        }

        // DELETE: api/admin/AdminJobPosts/{id} - Xóa job post
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteJobPost(int id)
        {
            try
            {
                var jobPost = await _context.JobPosts
                    .Include(j => j.Applications)
                    .Include(j => j.SavedJobs)
                    .Include(j => j.JobPostFields)
                    .Include(j => j.JobPostEmploymentTypes)
                    .Include(j => j.JobPostPromotions)
                    .Include(j => j.JobPostReports)
                    .Include(j => j.JobPostReviews)
                    .Include(j => j.Orderdetails)
                    .FirstOrDefaultAsync(j => j.Id == id);

                if (jobPost == null)
                {
                    return NotFound(new { message = "Không tìm thấy bài đăng" });
                }

                // Remove related data
                _context.Applications.RemoveRange(jobPost.Applications);
                _context.SavedJobs.RemoveRange(jobPost.SavedJobs);
                _context.JobPostFields.RemoveRange(jobPost.JobPostFields);
                _context.JobPostEmploymentTypes.RemoveRange(jobPost.JobPostEmploymentTypes);
                _context.JobPostPromotions.RemoveRange(jobPost.JobPostPromotions);
                _context.JobPostReports.RemoveRange(jobPost.JobPostReports);
                _context.JobPostReviews.RemoveRange(jobPost.JobPostReviews);
                _context.Orderdetails.RemoveRange(jobPost.Orderdetails);

                // Remove job post
                _context.JobPosts.Remove(jobPost);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Xóa bài đăng thành công" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi server: " + ex.Message });
            }
        }

        // PUT: api/admin/AdminJobPosts/{id}/status - Cập nhật trạng thái job post
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateJobPostStatus(int id, [FromBody] UpdateJobPostStatusDto statusDto)
        {
            try
            {
                var jobPost = await _context.JobPosts.FindAsync(id);
                if (jobPost == null)
                {
                    return NotFound(new { message = "Không tìm thấy bài đăng" });
                }

                jobPost.Status = statusDto.Status;
                await _context.SaveChangesAsync();

                return Ok(new { message = "Cập nhật trạng thái thành công" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi server: " + ex.Message });
            }
        }

        // GET: api/admin/AdminJobPosts/statistics - Lấy thống kê
        [HttpGet("statistics")]
        public async Task<ActionResult> GetStatistics()
        {
            try
            {
                var totalPosts = await _context.JobPosts.CountAsync();
                var activePosts = await _context.JobPosts.CountAsync(j => j.Status == "open");
                var closedPosts = await _context.JobPosts.CountAsync(j => j.Status == "closed");
                var pendingPosts = await _context.JobPosts.CountAsync(j => j.Status == "pending");
                var expiredPosts = await _context.JobPosts.CountAsync(j => j.ApplyDeadline < DateTime.UtcNow);

                var totalApplications = await _context.Applications.CountAsync();
                var totalReports = await _context.JobPostReports.CountAsync();

                // Top employers by job count
                var topEmployers = await _context.JobPosts
                    .Join(_context.Users, j => j.EmployerId, u => u.Id, (j, u) => new { j, u })
                    .GroupBy(x => new { x.u.Id, x.u.Username })
                    .Select(g => new
                    {
                        EmployerId = g.Key.Id,
                        EmployerName = g.Key.Username,
                        JobCount = g.Count(),
                        ActiveJobCount = g.Count(x => x.j.Status == "open")
                    })
                    .OrderByDescending(x => x.JobCount)
                    .Take(10)
                    .ToListAsync();                // Posts by month (last 12 months)
                var oneYearAgo = DateTime.UtcNow.AddMonths(-12);
                var postsByMonth = await _context.JobPosts
                    .Where(j => j.PostDate.HasValue && j.PostDate >= oneYearAgo)
                    .GroupBy(j => new { j.PostDate!.Value.Year, j.PostDate!.Value.Month })
                    .Select(g => new
                    {
                        Year = g.Key.Year,
                        Month = g.Key.Month,
                        Count = g.Count()
                    })
                    .OrderBy(x => x.Year).ThenBy(x => x.Month)
                    .ToListAsync();

                return Ok(new
                {
                    TotalPosts = totalPosts,
                    ActivePosts = activePosts,
                    ClosedPosts = closedPosts,
                    PendingPosts = pendingPosts,
                    ExpiredPosts = expiredPosts,
                    TotalApplications = totalApplications,
                    TotalReports = totalReports,
                    TopEmployers = topEmployers,
                    PostsByMonth = postsByMonth
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi server: " + ex.Message });
            }
        }

        // GET: api/admin/AdminJobPosts/{id}/applications - Lấy danh sách ứng viên của job post
        [HttpGet("{id}/applications")]
        public async Task<ActionResult> GetJobApplications(int id, int page = 1, int pageSize = 10)
        {
            try
            {
                var jobPost = await _context.JobPosts.FindAsync(id);
                if (jobPost == null)
                {
                    return NotFound(new { message = "Không tìm thấy bài đăng" });
                }
                var query = _context.Applications
                    .Where(a => a.JobId == id)
                    .Include(a => a.User)
                    .OrderByDescending(a => a.AppliedAt);

                var totalItems = await query.CountAsync();
                var totalPages = (int)Math.Ceiling(totalItems / (double)pageSize); var applications = await query
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(a => new
                    {
                        a.Id,
                        ApplyDate = a.AppliedAt,
                        a.Status,
                        CvUrl = a.CvFile,
                        User = new
                        {
                            a.User.Id,
                            a.User.Username,
                            a.User.Email,
                            a.User.Avatar
                        }
                    })
                    .ToListAsync();

                return Ok(new
                {
                    Applications = applications,
                    CurrentPage = page,
                    TotalPages = totalPages,
                    TotalItems = totalItems,
                    PageSize = pageSize
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi server: " + ex.Message });
            }
        }
    }
}