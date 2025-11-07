using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BACKEND.Models;
using BACKEND.DTOs;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

[Route("api/[controller]")]
[ApiController]
public class UserController : ControllerBase
{
    private readonly TopcvBeContext _context;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public UserController(TopcvBeContext context, IHttpContextAccessor httpContextAccessor)
    {
        _context = context;
        _httpContextAccessor = httpContextAccessor;
    }
    [Authorize]
    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        var userIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier);

        if (userIdClaim == null)
            return Unauthorized(new { message = "Không xác định được người dùng." });

        int userId = int.Parse(userIdClaim.Value);

        var user = await _context.Users
            .Include(u => u.Role)
            .Include(u => u.CandidateProfiles)
            .Include(u => u.CompanyProfiles)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
            return NotFound(new { message = "Không tìm thấy người dùng." });

        string? avatar = !string.IsNullOrEmpty(user.Avatar)
            ? (user.Avatar.StartsWith("http") ? user.Avatar : $"{Request.Scheme}://{Request.Host}/uploads/avatars/{user.Avatar}")
            : null;

        var role = user.Role?.Name?.ToLower() ?? "user";

        // Return different data based on role
        if (role == "candidate")
        {
            var candidateProfile = user.CandidateProfiles.FirstOrDefault();
            return Ok(new
            {
                user.Id,
                user.Username,
                user.Email,
                FullName = candidateProfile?.Fullname ?? user.Username,
                Phone = candidateProfile?.Phone,
                Address = candidateProfile?.Address,
                DateOfBirth = candidateProfile?.DateOfBirth?.ToString("yyyy-MM-dd"),
                Avatar = avatar,
                Role = role,
                CvFilePath = candidateProfile?.CvFilePath
            });
        }
        else if (role == "employer")
        {
            var companyProfile = user.CompanyProfiles.FirstOrDefault();
            return Ok(new
            {
                user.Id,
                user.Username,
                user.Email,
                CompanyName = companyProfile?.CompanyName ?? user.Username,
                Description = companyProfile?.Description,
                Website = companyProfile?.Website,
                Location = companyProfile?.Location,
                Avatar = avatar,
                Role = role
            });
        }
        else
        {
            // Regular user or admin
            return Ok(new
            {
                user.Id,
                user.Username,
                user.Email,
                FullName = user.Username,
                Avatar = avatar,
                Role = role
            });
        }
    }
    [Authorize(Roles = "candidate")]
    [HttpGet("cv")]
    public async Task<IActionResult> GetCvInfo()
    {
        var userIdStr = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdStr))
            return Unauthorized(new { message = "Không xác định được người dùng." });

        int userId = int.Parse(userIdStr);


        var cv = await _context.CandidateProfiles
            .Where(cp => cp.UserId == userId)
            .Select(cp => new
            {
                cp.CvFilePath
            })
            .FirstOrDefaultAsync();

        return Ok(new
        {
            HasCv = !string.IsNullOrEmpty(cv?.CvFilePath),
            CvFile = cv?.CvFilePath
        });
    }

    [Authorize(Roles = "employer")]
    [HttpGet("pro-subscription")]
    public async Task<IActionResult> GetProSubscription()
    {
        var userIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier);

        if (userIdClaim == null)
            return Unauthorized(new { message = "Không xác định được người dùng." });

        int userId = int.Parse(userIdClaim.Value);
        var now = DateTime.UtcNow;

        var pro = await _context.ProSubscriptions
            .Where(p => p.UserId == userId && p.StartDate <= now && p.EndDate >= now)
            .Select(p => new
            {
                p.StartDate,
                p.EndDate,
                p.PostsLeftThisPeriod
            })
            .FirstOrDefaultAsync();

        if (pro == null)
        {
            var monthStart = new DateTime(now.Year, now.Month, 1);

            int postsThisMonth = await _context.JobPosts
                .Where(j => j.EmployerId == userId && j.PostDate >= monthStart)
                .CountAsync();

            int freeQuota = 5;
            int postsLeft = Math.Max(0, freeQuota - postsThisMonth);

            return Ok(new
            {
                isPro = false,
                postsLeft = postsLeft
            });
        }


        return Ok(new
        {
            isPro = true,
            startDate = pro.StartDate,
            endDate = pro.EndDate,
            postsLeft = pro.PostsLeftThisPeriod
        });
    }
    [Authorize]
    [HttpPut("update-profile")]
    public async Task<IActionResult> UpdateProfile([FromForm] UpdateProfileDto updateProfileDto, IFormFile? avatar, IFormFile? cv)
    {
        var userIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null)
            return Unauthorized(new { message = "Không xác định được người dùng." });

        int userId = int.Parse(userIdClaim.Value); var user = await _context.Users
            .Include(u => u.CandidateProfiles)
            .Include(u => u.CompanyProfiles)
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
            return NotFound(new { message = "Không tìm thấy người dùng." });

        if (!string.IsNullOrEmpty(updateProfileDto.Username))
            user.Username = updateProfileDto.Username;

        var userRole = user.Role?.Name?.ToLower() ?? "user";        
        if (userRole == "candidate")
        {
            var candidateProfile = user.CandidateProfiles.FirstOrDefault();
            if (candidateProfile != null)
            {
                if (!string.IsNullOrEmpty(updateProfileDto.Fullname))
                    candidateProfile.Fullname = updateProfileDto.Fullname;
                if (!string.IsNullOrEmpty(updateProfileDto.Phone))
                    candidateProfile.Phone = updateProfileDto.Phone;
                if (!string.IsNullOrEmpty(updateProfileDto.Address))
                    candidateProfile.Address = updateProfileDto.Address;
                if (!string.IsNullOrEmpty(updateProfileDto.DateOfBirth) && DateOnly.TryParse(updateProfileDto.DateOfBirth, out var dob))
                    candidateProfile.DateOfBirth = dob;


                if (cv != null)
                {
                    var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "cvs");
                    Directory.CreateDirectory(uploadsFolder);

                    var fileName = Guid.NewGuid().ToString() + Path.GetExtension(cv.FileName);
                    var filePath = Path.Combine(uploadsFolder, fileName);

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await cv.CopyToAsync(stream);
                    }

                    candidateProfile.CvFilePath = fileName;
                }
            }
        }
        else if (userRole == "employer")
        {
            var companyProfile = user.CompanyProfiles.FirstOrDefault();
            if (companyProfile != null)
            {
                if (!string.IsNullOrEmpty(updateProfileDto.CompanyName))
                    companyProfile.CompanyName = updateProfileDto.CompanyName;
                if (!string.IsNullOrEmpty(updateProfileDto.Description))
                    companyProfile.Description = updateProfileDto.Description;
                if (!string.IsNullOrEmpty(updateProfileDto.Website))
                    companyProfile.Website = updateProfileDto.Website;
                if (!string.IsNullOrEmpty(updateProfileDto.Location))
                    companyProfile.Location = updateProfileDto.Location;
            }
        }

        // Handle avatar upload
        if (avatar != null)
        {
            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "avatars");
            Directory.CreateDirectory(uploadsFolder);

            var fileName = Guid.NewGuid().ToString() + Path.GetExtension(avatar.FileName);
            var filePath = Path.Combine(uploadsFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await avatar.CopyToAsync(stream);
            }

            user.Avatar = fileName;
        }
        try
        {
            await _context.SaveChangesAsync();

            // Return simple response to avoid TypeLoadException
            var response = new
            {
                message = "Cập nhật thông tin thành công!",
                success = true
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            var errorResponse = new
            {
                message = "Lỗi khi cập nhật thông tin.",
                error = ex.Message,
                success = false
            };

            return StatusCode(500, errorResponse);
        }
    }

    [Authorize]
    [HttpPut("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto changePasswordDto)
    {
        var userIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null)
            return Unauthorized(new { message = "Không xác định được người dùng." });

        int userId = int.Parse(userIdClaim.Value);

        var user = await _context.Users.FindAsync(userId);
        if (user == null)
            return NotFound(new { message = "Không tìm thấy người dùng." });

        // Check if current password is provided
        if (string.IsNullOrEmpty(changePasswordDto.CurrentPassword))
            return BadRequest(new { message = "Vui lòng nhập mật khẩu hiện tại." });

        // Verify current password
        if (string.IsNullOrEmpty(user.Password) || !VerifyPassword(changePasswordDto.CurrentPassword, user.Password))
            return BadRequest(new { message = "Mật khẩu hiện tại không đúng." });

        // Hash new password
        user.Password = HashPassword(changePasswordDto.NewPassword);

        try
        {
            await _context.SaveChangesAsync();
            return Ok(new { message = "Đổi mật khẩu thành công!" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi khi đổi mật khẩu.", error = ex.Message });
        }
    }

    [Authorize]
    [HttpPut("notification-settings")]
    public async Task<IActionResult> UpdateNotificationSettings([FromBody] NotificationSettingsDto notificationSettings)
    {
        var userIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null)
            return Unauthorized(new { message = "Không xác định được người dùng." });

        int userId = int.Parse(userIdClaim.Value);

        var user = await _context.Users.FindAsync(userId);
        if (user == null)
            return NotFound(new { message = "Không tìm thấy người dùng." });

        try
        {
            await _context.SaveChangesAsync();
            return Ok(new { message = "Cập nhật cài đặt thông báo thành công!" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi khi cập nhật cài đặt.", error = ex.Message });
        }
    }

    [Authorize]
    [HttpPut("privacy-settings")]
    public async Task<IActionResult> UpdatePrivacySettings([FromBody] PrivacySettingsDto privacySettings)
    {
        var userIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null)
            return Unauthorized(new { message = "Không xác định được người dùng." });

        int userId = int.Parse(userIdClaim.Value);

        var user = await _context.Users.FindAsync(userId);
        if (user == null)
            return NotFound(new { message = "Không tìm thấy người dùng." });

        try
        {
            await _context.SaveChangesAsync();
            return Ok(new { message = "Cập nhật cài đặt riêng tư thành công!" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi khi cập nhật cài đặt.", error = ex.Message });
        }
    }

    [Authorize]
    [HttpPut("theme-settings")]
    public async Task<IActionResult> UpdateThemeSettings([FromBody] ThemeSettingsDto themeSettings)
    {
        var userIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null)
            return Unauthorized(new { message = "Không xác định được người dùng." });

        int userId = int.Parse(userIdClaim.Value);

        var user = await _context.Users.FindAsync(userId);
        if (user == null)
            return NotFound(new { message = "Không tìm thấy người dùng." });

        try
        {
            await _context.SaveChangesAsync();
            return Ok(new { message = "Cập nhật giao diện thành công!" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi khi cập nhật giao diện.", error = ex.Message });
        }
    }

    [Authorize(Roles = "candidate")]
    [HttpPost("upload-cv")]
    public async Task<IActionResult> UploadCV(IFormFile cvFile)
    {
        var userIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null)
            return Unauthorized(new { message = "Không xác định được người dùng." });

        int userId = int.Parse(userIdClaim.Value);

        if (cvFile == null || cvFile.Length == 0)
            return BadRequest(new { message = "Vui lòng chọn file CV." });

        var allowedExtensions = new[] { ".pdf", ".doc", ".docx" };
        var fileExtension = Path.GetExtension(cvFile.FileName).ToLower();

        if (!allowedExtensions.Contains(fileExtension))
            return BadRequest(new { message = "Chỉ chấp nhận file PDF, DOC, DOCX." });

        var candidateProfile = await _context.CandidateProfiles.FirstOrDefaultAsync(cp => cp.UserId == userId);
        if (candidateProfile == null)
            return NotFound(new { message = "Không tìm thấy hồ sơ ứng viên." });

        try
        {
            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "cv");
            Directory.CreateDirectory(uploadsFolder);

            var fileName = Guid.NewGuid().ToString() + fileExtension;
            var filePath = Path.Combine(uploadsFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await cvFile.CopyToAsync(stream);
            }

            candidateProfile.CvFilePath = fileName;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Tải CV thành công!", fileName = fileName });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi khi tải CV.", error = ex.Message });
        }
    }

    [Authorize(Roles = "candidate")]
    [HttpGet("download-cv")]
    public async Task<IActionResult> DownloadCV()
    {
        var userIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null)
            return Unauthorized(new { message = "Không xác định được người dùng." });

        int userId = int.Parse(userIdClaim.Value);

        var candidateProfile = await _context.CandidateProfiles
            .FirstOrDefaultAsync(cp => cp.UserId == userId);

        if (candidateProfile == null)
            return NotFound(new { message = "Không tìm thấy hồ sơ ứng viên." });

        if (string.IsNullOrEmpty(candidateProfile.CvFilePath))
            return NotFound(new { message = "Bạn chưa có CV nào được tải lên." });

        var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "cvs", candidateProfile.CvFilePath);

        if (!System.IO.File.Exists(filePath))
            return NotFound(new { message = "File CV không tồn tại." });

        var fileBytes = await System.IO.File.ReadAllBytesAsync(filePath);
        var fileExtension = Path.GetExtension(candidateProfile.CvFilePath);
        var contentType = fileExtension.ToLower() switch
        {
            ".pdf" => "application/pdf",
            ".doc" => "application/msword",
            ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            _ => "application/octet-stream"
        };

        var fileName = $"CV_{candidateProfile.Fullname ?? "Unknown"}{fileExtension}";

        return File(fileBytes, contentType, fileName);
    }

    private string HashPassword(string password)
    {
        if (string.IsNullOrEmpty(password))
            return string.Empty;

        using (var sha256 = SHA256.Create())
        {
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(hashedBytes);
        }
    }
    private bool VerifyPassword(string password, string hashedPassword)
    {
        if (string.IsNullOrEmpty(password) || string.IsNullOrEmpty(hashedPassword))
            return false;

        return HashPassword(password) == hashedPassword;
    }

}
