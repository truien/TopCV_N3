using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BACKEND.DTOs;
using BACKEND.Models;
using System.Security.Claims;

namespace BACKEND.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class JobPostReviewsController : ControllerBase
    {
        private readonly TopcvBeContext _context;

        public JobPostReviewsController(TopcvBeContext context)
        {
            _context = context;
        }        // GET: api/JobPostReviews/jobpost/{jobPostId} - Lấy danh sách đánh giá của một bài đăng
        [HttpGet("jobpost/{jobPostId}")]
        public async Task<ActionResult<IEnumerable<JobPostReviewResponseDto>>> GetJobPostReviews(int jobPostId, int page = 1, int pageSize = 10)
        {
            try
            {
                var baseUrl = $"{Request.Scheme}://{Request.Host}/";

                var reviews = await _context.JobPostReviews
                    .Where(r => r.JobPostId == jobPostId)
                    .Include(r => r.User)
                    .OrderByDescending(r => r.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(r => new JobPostReviewResponseDto
                    {
                        Id = r.Id,
                        JobPostId = r.JobPostId,
                        UserId = r.UserId,
                        Rating = r.Rating,
                        Comment = r.Comment,
                        CreatedAt = r.CreatedAt,
                        UserName = r.User.Username,
                        UserAvatar = string.IsNullOrEmpty(r.User.Avatar)
                            ? null
                            : (r.User.Avatar.StartsWith("http") ? r.User.Avatar : baseUrl + "uploads/avatars/" + r.User.Avatar)
                    })
                    .ToListAsync();

                return Ok(reviews);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi server: " + ex.Message });
            }
        }     
        [HttpGet("jobpost/{jobPostId}/stats")]
        public async Task<ActionResult<JobPostReviewsStatsDto>> GetJobPostReviewsStats(int jobPostId)
        {
            try
            {
                var reviews = await _context.JobPostReviews
                    .Where(r => r.JobPostId == jobPostId)
                    .ToListAsync();

                if (!reviews.Any())
                {
                    return Ok(new JobPostReviewsStatsDto
                    {
                        AverageRating = 0,
                        TotalReviews = 0,
                        RatingCounts = new Dictionary<int, int>()
                    });
                }

                var stats = new JobPostReviewsStatsDto
                {
                    AverageRating = Math.Round(reviews.Average(r => r.Rating), 1),
                    TotalReviews = reviews.Count,
                    RatingCounts = reviews
                        .GroupBy(r => (int)r.Rating)
                        .ToDictionary(g => g.Key, g => g.Count())
                };

                // Đảm bảo có đủ 5 mức đánh giá
                for (int i = 1; i <= 5; i++)
                {
                    if (!stats.RatingCounts.ContainsKey(i))
                    {
                        stats.RatingCounts[i] = 0;
                    }
                }

                return Ok(stats);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi server: " + ex.Message });
            }
        }

        // POST: api/JobPostReviews - Tạo đánh giá mới
        [HttpPost]
        [Authorize]
        public async Task<ActionResult<JobPostReviewResponseDto>> CreateReview([FromBody] CreateJobPostReviewDto reviewDto)
        {
            try
            {
                var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userIdStr))
                    return Unauthorized();

                int userId = int.Parse(userIdStr);

                // Kiểm tra xem bài đăng có tồn tại không
                var jobPost = await _context.JobPosts.FindAsync(reviewDto.JobPostId);
                if (jobPost == null)
                {
                    return NotFound(new { message = "Bài đăng không tồn tại" });
                }

                // Kiểm tra xem user đã đánh giá bài đăng này chưa
                var existingReview = await _context.JobPostReviews
                    .FirstOrDefaultAsync(r => r.JobPostId == reviewDto.JobPostId && r.UserId == userId);

                if (existingReview != null)
                {
                    return BadRequest(new { message = "Bạn đã đánh giá bài đăng này rồi" });
                }

                // Kiểm tra rating hợp lệ (1-5)
                if (reviewDto.Rating < 1 || reviewDto.Rating > 5)
                {
                    return BadRequest(new { message = "Đánh giá phải từ 1 đến 5 sao" });
                }

                // Tạo review mới
                var review = new JobPostReview
                {
                    JobPostId = reviewDto.JobPostId,
                    UserId = userId,
                    Rating = reviewDto.Rating,
                    Comment = reviewDto.Comment,
                    CreatedAt = DateTime.UtcNow
                };

                _context.JobPostReviews.Add(review);
                await _context.SaveChangesAsync();

                // Lấy thông tin user để trả về
                var user = await _context.Users.FindAsync(userId);
                var baseUrl = $"{Request.Scheme}://{Request.Host}/";

                var response = new JobPostReviewResponseDto
                {
                    Id = review.Id,
                    JobPostId = review.JobPostId,
                    UserId = review.UserId,
                    Rating = review.Rating,
                    Comment = review.Comment,
                    CreatedAt = review.CreatedAt,
                    UserName = user!.Username,
                    UserAvatar = string.IsNullOrEmpty(user.Avatar)
                        ? null
                        : (user.Avatar.StartsWith("http") ? user.Avatar : baseUrl + "uploads/avatars/" + user.Avatar)
                };

                return CreatedAtAction(nameof(GetJobPostReviews), new { jobPostId = review.JobPostId }, response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi server: " + ex.Message });
            }
        }

        // PUT: api/JobPostReviews/{id} - Cập nhật đánh giá
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateReview(int id, [FromBody] CreateJobPostReviewDto reviewDto)
        {
            try
            {
                var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userIdStr))
                    return Unauthorized();

                int userId = int.Parse(userIdStr);

                var review = await _context.JobPostReviews.FindAsync(id);
                if (review == null)
                {
                    return NotFound(new { message = "Đánh giá không tồn tại" });
                }

                // Kiểm tra quyền sở hữu
                if (review.UserId != userId)
                {
                    return Forbid("Bạn không có quyền sửa đánh giá này");
                }

                // Kiểm tra rating hợp lệ (1-5)
                if (reviewDto.Rating < 1 || reviewDto.Rating > 5)
                {
                    return BadRequest(new { message = "Đánh giá phải từ 1 đến 5 sao" });
                }

                review.Rating = reviewDto.Rating;
                review.Comment = reviewDto.Comment;

                await _context.SaveChangesAsync();

                return Ok(new { message = "Cập nhật đánh giá thành công" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi server: " + ex.Message });
            }
        }

        // DELETE: api/JobPostReviews/{id} - Xóa đánh giá
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteReview(int id)
        {
            try
            {
                var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userIdStr))
                    return Unauthorized();

                int userId = int.Parse(userIdStr);

                var review = await _context.JobPostReviews.FindAsync(id);
                if (review == null)
                {
                    return NotFound(new { message = "Đánh giá không tồn tại" });
                }

                // Kiểm tra quyền sở hữu hoặc admin
                var userRole = User.FindFirstValue(ClaimTypes.Role);
                if (review.UserId != userId && userRole != "admin")
                {
                    return Forbid("Bạn không có quyền xóa đánh giá này");
                }

                _context.JobPostReviews.Remove(review);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Xóa đánh giá thành công" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi server: " + ex.Message });
            }
        }

        // GET: api/JobPostReviews/user/{userId} - Lấy danh sách đánh giá của user
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<JobPostReviewResponseDto>>> GetUserReviews(int userId, int page = 1, int pageSize = 10)
        {
            try
            {
                var baseUrl = $"{Request.Scheme}://{Request.Host}/";

                var reviews = await _context.JobPostReviews
                    .Where(r => r.UserId == userId)
                    .Include(r => r.User)
                    .Include(r => r.JobPost)
                    .OrderByDescending(r => r.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(r => new JobPostReviewResponseDto
                    {
                        Id = r.Id,
                        JobPostId = r.JobPostId,
                        UserId = r.UserId,
                        Rating = r.Rating,
                        Comment = r.Comment,
                        CreatedAt = r.CreatedAt,
                        UserName = r.User.Username,
                        UserAvatar = string.IsNullOrEmpty(r.User.Avatar)
                            ? null
                            : (r.User.Avatar.StartsWith("http") ? r.User.Avatar : baseUrl + "uploads/avatars/" + r.User.Avatar)
                    })
                    .ToListAsync();

                return Ok(reviews);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi server: " + ex.Message });
            }
        }

        // GET: api/JobPostReviews/check/{jobPostId} - Kiểm tra user đã đánh giá chưa
        [HttpGet("check/{jobPostId}")]
        [Authorize]
        public async Task<ActionResult> CheckUserReviewed(int jobPostId)
        {
            try
            {
                var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userIdStr))
                    return Unauthorized();

                int userId = int.Parse(userIdStr);

                var hasReviewed = await _context.JobPostReviews
                    .AnyAsync(r => r.JobPostId == jobPostId && r.UserId == userId);

                return Ok(new { hasReviewed });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi server: " + ex.Message });
            }
        }        // GET: api/JobPostReviews/employer/reviews - Lấy tất cả đánh giá của bài viết thuộc employer
        [HttpGet("employer/reviews")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<JobPostReviewResponseDto>>> GetEmployerReviews(int page = 1, int pageSize = 10)
        {
            try
            {
                var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userIdStr))
                    return Unauthorized();

                int employerId = int.Parse(userIdStr);
                var baseUrl = $"{Request.Scheme}://{Request.Host}/";

                // Lấy danh sách bài viết của employer
                var employerJobPostIds = await _context.JobPosts
                    .Where(jp => jp.EmployerId == employerId)
                    .Select(jp => jp.Id)
                    .ToListAsync();

                if (!employerJobPostIds.Any())
                {
                    return Ok(new List<JobPostReviewResponseDto>());
                }

                var reviews = await _context.JobPostReviews
                    .Where(r => employerJobPostIds.Contains(r.JobPostId))
                    .Include(r => r.User)
                    .Include(r => r.JobPost)
                    .OrderByDescending(r => r.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(r => new JobPostReviewResponseDto
                    {
                        Id = r.Id,
                        JobPostId = r.JobPostId,
                        UserId = r.UserId,
                        Rating = r.Rating,
                        Comment = r.Comment,
                        CreatedAt = r.CreatedAt,
                        UserName = r.User.Username,
                        UserAvatar = string.IsNullOrEmpty(r.User.Avatar)
                            ? null
                            : (r.User.Avatar.StartsWith("http") ? r.User.Avatar : baseUrl + "uploads/avatars/" + r.User.Avatar),
                        JobPostTitle = r.JobPost.Title
                    })
                    .ToListAsync();

                var totalReviews = await _context.JobPostReviews
                    .Where(r => employerJobPostIds.Contains(r.JobPostId))
                    .CountAsync();

                return Ok(new
                {
                    reviews,
                    totalPages = (int)Math.Ceiling((double)totalReviews / pageSize),
                    currentPage = page,
                    totalReviews
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi server: " + ex.Message });
            }
        }

        // GET: api/JobPostReviews/employer/jobpost/{jobPostId}/reviews - Lấy đánh giá cho bài viết cụ thể của employer
        [HttpGet("employer/jobpost/{jobPostId}/reviews")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<JobPostReviewResponseDto>>> GetEmployerJobPostReviews(int jobPostId, int page = 1, int pageSize = 10)
        {
            try
            {
                var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userIdStr))
                    return Unauthorized();

                int employerId = int.Parse(userIdStr);

                // Kiểm tra bài viết có thuộc về employer không
                var jobPostExists = await _context.JobPosts
                    .AnyAsync(jp => jp.Id == jobPostId && jp.EmployerId == employerId);

                if (!jobPostExists)
                {
                    return NotFound(new { message = "Không tìm thấy bài viết hoặc bạn không có quyền truy cập" });
                }

                var baseUrl = $"{Request.Scheme}://{Request.Host}/";

                var reviews = await _context.JobPostReviews
                    .Where(r => r.JobPostId == jobPostId)
                    .Include(r => r.User)
                    .OrderByDescending(r => r.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(r => new JobPostReviewResponseDto
                    {
                        Id = r.Id,
                        JobPostId = r.JobPostId,
                        UserId = r.UserId,
                        Rating = r.Rating,
                        Comment = r.Comment,
                        CreatedAt = r.CreatedAt,
                        UserName = r.User.Username,
                        UserAvatar = string.IsNullOrEmpty(r.User.Avatar)
                            ? null
                            : (r.User.Avatar.StartsWith("http") ? r.User.Avatar : baseUrl + "uploads/avatars/" + r.User.Avatar)
                    })
                    .ToListAsync();

                var totalReviews = await _context.JobPostReviews
                    .Where(r => r.JobPostId == jobPostId)
                    .CountAsync();

                return Ok(new
                {
                    reviews,
                    totalPages = (int)Math.Ceiling((double)totalReviews / pageSize),
                    currentPage = page,
                    totalReviews
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi server: " + ex.Message });
            }
        }

        // GET: api/JobPostReviews/employer/stats - Thống kê tổng quan đánh giá của employer
        [HttpGet("employer/stats")]
        [Authorize]
        public async Task<ActionResult> GetEmployerReviewsStats()
        {
            try
            {
                var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userIdStr))
                    return Unauthorized();

                int employerId = int.Parse(userIdStr);

                // Lấy danh sách bài viết của employer
                var employerJobPostIds = await _context.JobPosts
                    .Where(jp => jp.EmployerId == employerId)
                    .Select(jp => jp.Id)
                    .ToListAsync();

                if (!employerJobPostIds.Any())
                {
                    return Ok(new
                    {
                        totalReviews = 0,
                        averageRating = 0.0,
                        ratingDistribution = new Dictionary<int, int>
                        {
                            {1, 0}, {2, 0}, {3, 0}, {4, 0}, {5, 0}
                        },
                        jobPostsWithReviews = 0,
                        recentReviews = new List<object>()
                    });
                }

                var reviews = await _context.JobPostReviews
                    .Where(r => employerJobPostIds.Contains(r.JobPostId))
                    .Include(r => r.User)
                    .Include(r => r.JobPost)
                    .ToListAsync();

                var totalReviews = reviews.Count;
                var averageRating = totalReviews > 0 ? reviews.Average(r => r.Rating) : 0.0;

                var ratingDistribution = new Dictionary<int, int>
                {
                    {1, reviews.Count(r => r.Rating == 1)},
                    {2, reviews.Count(r => r.Rating == 2)},
                    {3, reviews.Count(r => r.Rating == 3)},
                    {4, reviews.Count(r => r.Rating == 4)},
                    {5, reviews.Count(r => r.Rating == 5)}
                };

                var jobPostsWithReviews = employerJobPostIds.Count(jpId =>
                    reviews.Any(r => r.JobPostId == jpId));

                var baseUrl = $"{Request.Scheme}://{Request.Host}/";
                var recentReviews = reviews
                    .OrderByDescending(r => r.CreatedAt)
                    .Take(5)
                    .Select(r => new
                    {
                        Id = r.Id,
                        JobPostId = r.JobPostId,
                        JobPostTitle = r.JobPost.Title,
                        Rating = r.Rating,
                        Comment = r.Comment,
                        CreatedAt = r.CreatedAt,
                        UserName = r.User.Username,
                        UserAvatar = string.IsNullOrEmpty(r.User.Avatar)
                            ? null
                            : (r.User.Avatar.StartsWith("http") ? r.User.Avatar : baseUrl + "uploads/avatars/" + r.User.Avatar)
                    })
                    .ToList();

                return Ok(new
                {
                    totalReviews,
                    averageRating = Math.Round(averageRating, 1),
                    ratingDistribution,
                    jobPostsWithReviews,
                    recentReviews
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi server: " + ex.Message });
            }
        }
    }
}
