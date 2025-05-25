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
        [HttpGet("search")]
        public async Task<ActionResult> SearchJobPosts(
          string? keyword = null,
          string? fieldId = null,
          string? employmentTypeId = null,
          string? location = null,
          string? minSalary = null,
          string? maxSalary = null,
          string? sortBy = "1",
          int page = 1,
          int pageSize = 10)
        {
            var baseUrl = $"{Request.Scheme}://{Request.Host}/";
            var now = DateTime.UtcNow;


            var query = from job in _context.JobPosts
                        join user in _context.Users on job.EmployerId equals user.Id
                        join companyProfile in _context.CompanyProfiles on user.Id equals companyProfile.UserId into companyGroup
                        from cp in companyGroup.DefaultIfEmpty()
                        where job.Status == "open" && job.ApplyDeadline >= now
                        select new
                        {
                            Id = job.Id,
                            CompanyLogo = string.IsNullOrEmpty(user.Avatar)
                                ? null
                                : (user.Avatar.StartsWith("http") ? user.Avatar : baseUrl + "avatar/" + user.Avatar),
                            CompanyName = cp != null ? cp.CompanyName : user.Username,
                            Title = job.Title,
                            Salary = job.SalaryRange,
                            Location = job.Location,
                            DueDate = job.ApplyDeadline,
                            PostedDate = job.PostDate,
                            UserId = user.Id,
                        };

            // Đảm bảo không có bản ghi trùng lặp
            query = query.Distinct();            // Truy vấn riêng để lấy thông tin gói quảng cáo hiện tại
            // Xử lý để tránh lỗi khi có nhiều promotion cho cùng một job post
            var promotionsData = await _context.JobPostPromotions
                .Where(p => p.StartDate <= now && p.EndDate >= now)
                .Select(p => new { p.JobPostId, p.Package.HighlightType, p.Package.PriorityLevel })
                .ToListAsync();

            // Group by job post ID and select the promotion with highest priority
            var activePromotions = promotionsData
                .GroupBy(p => p.JobPostId)
                .ToDictionary(
                    g => g.Key,
                    g => g.OrderByDescending(p => p.PriorityLevel)
                         .ThenBy(p => p.HighlightType == "TopMax" ? 0 :
                                      p.HighlightType == "TopPro" ? 1 : 2)
                         .First().HighlightType
                );

            // Truy vấn riêng để lấy JobFieldIds
            var jobFieldIds = await _context.JobPostFields
                .AsNoTracking()
                .GroupBy(jpf => jpf.JobPostId)
                .Select(g => new
                {
                    JobPostId = g.Key,
                    FieldIds = g.Select(jpf => jpf.FieldId).ToList()
                })
                .ToDictionaryAsync(g => g.JobPostId, g => g.FieldIds);

            // Truy vấn riêng để lấy EmploymentTypeIds
            var employmentTypeIds = await _context.JobPostEmploymentTypes
                .AsNoTracking()
                .GroupBy(jpt => jpt.JobPostId)
                .Select(g => new
                {
                    JobPostId = g.Key,
                    TypeIds = g.Select(jpt => jpt.EmploymentTypeId).ToList()
                })
                .ToDictionaryAsync(g => g.JobPostId, g => g.TypeIds);

            // Lấy thông tin về Pro subscriptions - tối ưu bằng cách lấy cả UserId và Status trong một truy vấn
            var proUsers = await _context.ProSubscriptions
                .Where(p => p.StartDate <= now && p.EndDate >= now)
                .Select(p => p.UserId)
                .Distinct()
                .ToListAsync();

            // Kết hợp các dữ liệu để tạo đối tượng kết quả trong bộ nhớ
            var jobResults = await query.ToListAsync();

            var enrichedJobs = jobResults.Select(job => new
            {
                job.Id,
                job.CompanyLogo,
                job.CompanyName,
                job.Title,
                job.Salary,
                job.Location,
                job.DueDate,
                job.PostedDate,
                JobFieldIds = jobFieldIds.ContainsKey(job.Id) ? jobFieldIds[job.Id] : new List<int>(),
                EmploymentTypeIds = employmentTypeIds.ContainsKey(job.Id) ? employmentTypeIds[job.Id] : new List<int>(),
                HighlightType = activePromotions.ContainsKey(job.Id) ? activePromotions[job.Id] : null,
                EmployerIsPro = proUsers.Contains(job.UserId)
            }).ToList();

            // Áp dụng các bộ lọc trong bộ nhớ cho tối ưu hóa
            var filteredJobs = enrichedJobs.AsEnumerable();

            // Lọc theo lĩnh vực ngành nghề
            if (!string.IsNullOrEmpty(fieldId))
            {
                int fieldIdValue = int.Parse(fieldId);
                filteredJobs = filteredJobs.Where(j => j.JobFieldIds.Contains(fieldIdValue));
            }

            // Lọc theo hình thức làm việc
            if (!string.IsNullOrEmpty(employmentTypeId))
            {
                int employmentIdValue = int.Parse(employmentTypeId);
                filteredJobs = filteredJobs.Where(j => j.EmploymentTypeIds.Contains(employmentIdValue));
            }

            // Lọc theo từ khóa tìm kiếm
            if (!string.IsNullOrEmpty(keyword))
            {
                string keywordLower = keyword.ToLower();
                filteredJobs = filteredJobs.Where(j =>
                    j.Title.ToLower().Contains(keywordLower) ||
                    j.CompanyName.ToLower().Contains(keywordLower) ||
                    (j.Location != null && j.Location.ToLower().Contains(keywordLower))
                );
            }

            // Lọc theo địa điểm
            if (!string.IsNullOrEmpty(location))
            {
                filteredJobs = filteredJobs.Where(j => j.Location != null && j.Location.Contains(location));
            }

            // Lọc theo khoảng lương
            if (!string.IsNullOrEmpty(minSalary) && decimal.TryParse(minSalary, out decimal minSalaryValue))
            {
                filteredJobs = filteredJobs.Where(j => j.Salary != null && (
                    j.Salary.Contains(minSalaryValue.ToString()) ||
                    j.Salary.Contains("Thỏa thuận") ||
                    j.Salary.Contains("Cạnh tranh")
                ));
            }

            if (!string.IsNullOrEmpty(maxSalary) && decimal.TryParse(maxSalary, out decimal maxSalaryValue))
            {
                filteredJobs = filteredJobs.Where(j => j.Salary != null && (
                    j.Salary.Contains(maxSalaryValue.ToString()) ||
                    j.Salary.Contains("Thỏa thuận") ||
                    j.Salary.Contains("Cạnh tranh")
                ));
            }

            // Áp dụng sắp xếp với ưu tiên gói quảng cáo và người dùng Pro
            IOrderedEnumerable<dynamic> orderedJobs;

            switch (sortBy)
            {
                case "2": // Sắp xếp theo hạn nộp hồ sơ với ưu tiên
                    orderedJobs = filteredJobs
                        .OrderByDescending(j => j.HighlightType == "TopMax")
                        .ThenByDescending(j => j.HighlightType == "TopPro")
                        .ThenByDescending(j => j.EmployerIsPro)
                        .ThenBy(j => j.DueDate);
                    break;
                case "1":
                case "all":
                default:
                    // Sắp xếp theo ngày đăng (mới nhất) với ưu tiên
                    orderedJobs = filteredJobs
                        .OrderByDescending(j => j.HighlightType == "TopMax")
                        .ThenByDescending(j => j.HighlightType == "TopPro")
                        .ThenByDescending(j => j.EmployerIsPro)
                        .ThenByDescending(j => j.PostedDate);
                    break;
            }

            // Đếm tổng số bản ghi phù hợp với điều kiện lọc
            var totalCount = orderedJobs.Count();

            // Phân trang
            var paginatedJobs = orderedJobs
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(j => new
                {
                    j.Id,
                    j.CompanyLogo,
                    j.CompanyName,
                    j.Title,
                    j.Salary,
                    j.Location,
                    j.DueDate,
                    j.HighlightType,
                    j.EmployerIsPro,
                    j.PostedDate
                })
                .ToList();

            return Ok(new
            {
                items = paginatedJobs,
                totalCount = totalCount,
                page = page,
                pageSize = pageSize,
                totalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            });
        }
        [HttpGet("promoted")]
        public async Task<IActionResult> GetPromotedJobs(int page = 1, int pageSize = 12, string location = "")
        {
            var now = DateTime.UtcNow;
            int skip = (page - 1) * pageSize;
            var baseUrl = $"{Request.Scheme}://{Request.Host}/";

            // Tối ưu truy vấn cơ bản
            var query = from job in _context.JobPosts
                        join user in _context.Users on job.EmployerId equals user.Id
                        join companyProfile in _context.CompanyProfiles on user.Id equals companyProfile.UserId into companyGroup
                        from cp in companyGroup.DefaultIfEmpty()
                        where job.Status == "open" && job.ApplyDeadline >= now
                        select new
                        {
                            Id = job.Id,
                            Avatar = string.IsNullOrEmpty(user.Avatar)
                                  ? null
                                  : (user.Avatar.StartsWith("http") ? user.Avatar : baseUrl + "avatar/" + user.Avatar),
                            Company = cp != null ? cp.CompanyName : user.Username,
                            JobTitle = job.Title,
                            Salary = job.SalaryRange,
                            Location = job.Location,
                            UserId = user.Id,
                            Slug = cp != null ? cp.Slug : user.Username,
                        };

            // Đảm bảo không có bản ghi trùng lặp
            query = query.Distinct();

            // Lấy thông tin jobs để xử lý trong bộ nhớ
            var jobResults = await query.ToListAsync();            // Truy vấn riêng để lấy thông tin gói quảng cáo
            // Xử lý để tránh lỗi khi có nhiều promotion cho cùng một job post
            var promotionsData = await _context.JobPostPromotions
                .Where(p => p.StartDate <= now && p.EndDate >= now)
                .Select(p => new { p.JobPostId, p.Package.HighlightType, p.Package.PriorityLevel })
                .ToListAsync();

            // Group by job post ID và chọn promotion có priority cao nhất
            var activePromotions = promotionsData
                .GroupBy(p => p.JobPostId)
                .ToDictionary(
                    g => g.Key,
                    g => g.OrderByDescending(p => p.PriorityLevel)
                         .ThenBy(p => p.HighlightType == "TopMax" ? 0 :
                                      p.HighlightType == "TopPro" ? 1 : 2)
                         .First().HighlightType
                );

            // Lấy thông tin về Pro subscriptions
            var proUsers = await _context.ProSubscriptions
                .Where(p => p.StartDate <= now && p.EndDate >= now)
                .Select(p => p.UserId)
                .Distinct()
                .ToListAsync();

            // Kết hợp dữ liệu trong bộ nhớ
            var enrichedJobs = jobResults.Select(job => new
            {
                job.Id,
                job.Avatar,
                job.Company,
                job.JobTitle,
                job.Salary,
                job.Location,
                HighlightType = activePromotions.ContainsKey(job.Id) ? activePromotions[job.Id] : null,
                EmployerIsPro = proUsers.Contains(job.UserId),
                job.Slug
            }).ToList();

            // Lọc theo địa điểm trong bộ nhớ (in-memory)
            var filteredJobs = enrichedJobs.AsEnumerable();

            if (!string.IsNullOrEmpty(location))
            {
                if (location == "Miền Bắc")
                {
                    filteredJobs = filteredJobs.Where(x => x.Location != null && (
                        x.Location.Contains("Hà Nội") ||
                        x.Location.Contains("Hải Dương") ||
                        x.Location.Contains("Hải Phòng")
                    ));
                }
                else if (location == "Miền Nam")
                {
                    filteredJobs = filteredJobs.Where(x => x.Location != null && (
                        x.Location.Contains("TP.HCM") ||
                        x.Location.Contains("Long An") ||
                        x.Location.Contains("Nha Trang")
                    ));
                }
                else
                {
                    filteredJobs = filteredJobs.Where(x => x.Location != null && x.Location.Contains(location));
                }
            }

            // Đếm tổng số bản ghi phù hợp với điều kiện lọc
            var totalJobs = filteredJobs.Count();

            // Sắp xếp với ưu tiên gói quảng cáo và người dùng Pro
            var orderedJobs = filteredJobs
                .OrderByDescending(x => x.HighlightType == "TopMax")
                .ThenByDescending(x => x.HighlightType == "TopPro")
                .ThenByDescending(x => x.EmployerIsPro)
                .ThenByDescending(x => x.Id);

            // Phân trang trong bộ nhớ
            var paginatedJobs = orderedJobs
                .Skip(skip)
                .Take(pageSize)
                .ToList();

            return Ok(new
            {
                Jobs = paginatedJobs,
                TotalJobs = totalJobs,
                CurrentPage = page,
                TotalPages = (int)Math.Ceiling((double)totalJobs / pageSize)
            });
        }
        [HttpGet("urgent")]
        public async Task<IActionResult> GetUrgentJobs([FromQuery] int limit = 0)
        {
            var now = DateTime.UtcNow;
            var baseUrl = $"{Request.Scheme}://{Request.Host}/";

            // 1. Lấy danh sách jobPostId có package id = 3 (urgent)
            var urgentJobIds = await _context.JobPostPromotions
                .Where(p => p.StartDate <= now && p.EndDate >= now && p.PackageId == 3)
                .Select(p => p.JobPostId)
                .Distinct()
                .ToListAsync();

            if (urgentJobIds.Count == 0)
            {
                return Ok(new List<object>());
            }

            // 2. Truy vấn thông tin job với các id đã lọc
            var query = from job in _context.JobPosts
                        join user in _context.Users on job.EmployerId equals user.Id
                        join companyProfile in _context.CompanyProfiles on user.Id equals companyProfile.UserId into companyGroup
                        from cp in companyGroup.DefaultIfEmpty()
                        where job.ApplyDeadline > now && urgentJobIds.Contains(job.Id) && job.Status == "open"
                        select new
                        {
                            Id = job.Id,
                            Title = job.Title,
                            CompanyName = cp != null ? cp.CompanyName : user.Username,
                            Location = job.Location,
                            SalaryRange = job.SalaryRange,
                            PostDate = job.PostDate,
                            Avatar = string.IsNullOrEmpty(user.Avatar)
                                ? null
                                : (user.Avatar.StartsWith("http") ? user.Avatar : baseUrl + "avatar/" + user.Avatar)
                        };

            // Sắp xếp theo ngày đăng (mới nhất)
            query = query.OrderByDescending(j => j.PostDate);

            // Giới hạn kết quả nếu cần
            if (limit > 0)
            {
                query = query.Take(limit);
            }

            var result = await query.ToListAsync();
            return Ok(result);
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
            var now = DateTime.UtcNow;

            // Tối ưu truy vấn để cải thiện hiệu suất và đảm bảo không có trùng lặp
            var query = (from job in _context.JobPosts
                         join companyProfile in _context.CompanyProfiles on job.EmployerId equals companyProfile.UserId
                         join user in _context.Users on job.EmployerId equals user.Id
                         where job.EmployerId == employerId
                               && job.Id != excludeId
                               && job.Status == "open"
                               && (job.ApplyDeadline == null || job.ApplyDeadline >= now)
                         select new
                         {
                             id = job.Id,
                             title = job.Title,
                             companyName = companyProfile.CompanyName,
                             avatar = string.IsNullOrEmpty(user.Avatar)
                                     ? null
                                     : (user.Avatar.StartsWith("http") ? user.Avatar : baseUrl + "/avatar/" + user.Avatar),
                             location = job.Location,
                             applyDeadline = job.ApplyDeadline,
                             postDate = job.PostDate,
                             salaryRange = job.SalaryRange
                         })
                        .AsNoTracking() // Cải thiện hiệu suất khi chỉ đọc dữ liệu
                        .Distinct()
                        .OrderByDescending(j => j.postDate);

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

            // Cách giải quyết đơn giản và hiệu quả hơn, tương tự như đã được triển khai
            var query = _context.JobPosts
                .Include(j => j.Employer)
                    .ThenInclude(e => e.CompanyProfiles)
                .Include(j => j.JobPostFields)
                    .ThenInclude(f => f.Field)
                .Include(j => j.JobPostEmploymentTypes)
                    .ThenInclude(em => em.EmploymentType)
                .Where(j => j.Id != excludeId && j.Status == "open" && j.ApplyDeadline >= now)
                .AsNoTracking()  // Cải thiện hiệu suất khi chỉ đọc dữ liệu
                .Distinct();      // Đảm bảo không có bản ghi trùng lặp

            // Sử dụng Distinct để tránh trùng lặp kết quả
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
                .Distinct()      // Loại bỏ các bản ghi trùng lặp
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
        [HttpGet("employer")]
        [Authorize(Roles = "employer")]
        public async Task<IActionResult> GetJobPostsByEmployer()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId)) return Unauthorized();

            var posts = await _context.JobPosts
                .Where(p => p.EmployerId == userId)
                .OrderByDescending(p => p.PostDate)
                .Select(p => new
                {
                    p.Id,
                    p.Title,
                    p.Status,
                    p.Location,
                    p.PostDate,
                    p.ApplyDeadline,
                    p.SalaryRange
                })
                .ToListAsync();

            return Ok(posts);
        }

        [HttpPut("{id}/status")]
        [Authorize(Roles = "employer")]
        public async Task<IActionResult> UpdateJobPostStatus(int id, [FromBody] string status)
        {
            if (status != "open" && status != "closed")
                return BadRequest("Trạng thái không hợp lệ");

            var jobPost = await _context.JobPosts.FindAsync(id);
            if (jobPost == null) return NotFound();

            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (jobPost.EmployerId.ToString() != userIdStr)
                return Forbid("Bạn không có quyền sửa bài viết này");

            jobPost.Status = status;
            await _context.SaveChangesAsync();
            return Ok("Cập nhật trạng thái thành công");
        }
        [HttpDelete("{id}")]
        [Authorize(Roles = "employer")]
        public async Task<IActionResult> DeleteJobPost(int id)
        {
            var jobPost = await _context.JobPosts.FindAsync(id);
            if (jobPost == null) return NotFound();

            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (jobPost.EmployerId.ToString() != userIdStr)
                return Forbid("Bạn không có quyền xoá bài viết này");

            var hasApplications = await _context.Applications.AnyAsync(a => a.JobId == id);
            if (hasApplications)
                return BadRequest("Bài viết đã có ứng viên ứng tuyển, không thể xoá");

            _context.JobPosts.Remove(jobPost);
            await _context.SaveChangesAsync();
            return Ok("Xoá bài viết thành công");
        }

        [HttpGet("employer-with-package")]
        [Authorize(Roles = "employer")]
        public async Task<IActionResult> GetJobPostsWithPackage()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId)) return Unauthorized();

            var baseUrl = $"{Request.Scheme}://{Request.Host}";

            var posts = await _context.JobPosts
                .Where(p => p.EmployerId == userId)
                .OrderByDescending(p => p.PostDate)
                .Select(p => new
                {
                    p.Id,
                    p.Title,
                    p.Status,
                    p.Location,
                    p.PostDate,
                    p.ApplyDeadline,
                    p.SalaryRange,
                    Package = _context.JobPostPromotions
                        .Where(pp => pp.JobPostId == p.Id)
                        .OrderByDescending(pp => pp.StartDate)
                        .Select(pp => new
                        {
                            pp.StartDate,
                            pp.EndDate,
                            PackageName = pp.Package.Name
                        })
                        .ToList()
                })
                .ToListAsync();

            return Ok(posts);
        }
        [HttpGet("company/{companyId}")]
        public async Task<IActionResult> GetByCompany(int companyId)
        {
            var now = DateTime.UtcNow;
            var jobs = await _context.JobPosts
                .Where(j => j.EmployerId == companyId && j.Status == "open" && (j.ApplyDeadline == null || j.ApplyDeadline >= now))
                .Select(j => new
                {
                    j.Id,
                    j.Title,
                    j.Location,
                    j.SalaryRange,
                    j.ApplyDeadline
                })
                .ToListAsync();

            return Ok(jobs);
        }
    }
}