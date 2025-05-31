using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BACKEND.Models;
using BACKEND.DTOs;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using BACKEND.Utils;

namespace BACKEND.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class NotificationController : ControllerBase
    {
        private readonly TopcvBeContext _context;
        private readonly NotificationService _notificationService;

        public NotificationController(TopcvBeContext context, NotificationService notificationService)
        {
            _context = context;
            _notificationService = notificationService;
        }
        [HttpGet]
        public async Task<ActionResult<NotificationListResponseDto>> GetNotifications(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? type = null,
            [FromQuery] bool? isRead = null)
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized();

            var userType = GetCurrentUserType();
            if (userType == null)
                return Unauthorized();

            try
            {
                // Sử dụng NotificationService thay vì truy cập trực tiếp _context
                var (notifications, totalCount) = await _notificationService.GetNotificationsWithPaginationAsync(
                    userId.Value, userType, page, pageSize, type, isRead);

                var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);

                return Ok(new NotificationListResponseDto
                {
                    Data = notifications.Select(n =>
                    {
                        dynamic notification = n;
                        return new NotificationResponseDto
                        {
                            Id = notification.Id,
                            Type = notification.Type,
                            Title = notification.Title,
                            Message = notification.Message,
                            Data = notification.Data,
                            IsRead = notification.IsRead,
                            ReadAt = notification.ReadAt,
                            CreatedAt = notification.CreatedAt,
                            Sender = notification.Sender != null ? new SenderDto
                            {
                                Id = notification.Sender.Id,
                                Username = notification.Sender.Username,
                                Avatar = notification.Sender.Avatar
                            } : null
                        };
                    }).ToList(),
                    TotalCount = totalCount,
                    Page = page,
                    PageSize = pageSize,
                    TotalPages = totalPages
                });
            }
            catch (Exception ex)
            {
                // Log error và return 500 thay vì để uncaught exception
                Console.WriteLine($"Error in GetNotifications: {ex.Message}");
                return StatusCode(500, new { message = "Internal server error while fetching notifications" });
            }
        }
        // GET: api/notification/unread-count        
        [HttpGet("unread-count")]
        public async Task<ActionResult<UnreadCountResponseDto>> GetUnreadCount()
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized();

            var userType = GetCurrentUserType();
            if (userType == null)
                return Unauthorized();

            try
            {
                // Sử dụng NotificationService thay vì truy cập trực tiếp _context
                var unreadCount = await _notificationService.GetUnreadCountAsync(userId.Value, userType);
                return Ok(new UnreadCountResponseDto { UnreadCount = unreadCount });
            }
            catch (Exception ex)
            {
                // Log error và return 500
                Console.WriteLine($"Error in GetUnreadCount: {ex.Message}");
                return StatusCode(500, new { message = "Internal server error while fetching unread count" });
            }
        }
        // GET: api/notification/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<NotificationResponseDto>> GetNotification(int id)
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized();

            var userType = GetCurrentUserType();
            if (userType == null)
                return Unauthorized(); var notification = await _context.Notifications
                .Include(n => n.Sender)
                .Where(n => n.Id == id &&
                           n.RecipientId == userId &&
                           n.RecipientType == userType)
                .FirstOrDefaultAsync();

            if (notification == null)
            {
                return NotFound(new { Message = "Notification not found" });
            }

            var result = new NotificationResponseDto
            {
                Id = notification.Id,
                Type = notification.Type,
                Title = notification.Title,
                Message = notification.Message,
                Data = notification.Data,
                IsRead = notification.IsRead,
                ReadAt = notification.ReadAt,
                CreatedAt = notification.CreatedAt,
                Sender = notification.Sender != null ? new SenderDto
                {
                    Id = notification.Sender.Id,
                    Username = notification.Sender.Username,
                    Avatar = notification.Sender.Avatar
                } : null
            };

            return Ok(result);
        }

        [HttpPut("{id}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized();

            var userType = GetCurrentUserType();
            if (userType == null)
                return Unauthorized();

            var notification = await _context.Notifications
                .Where(n => n.Id == id &&
                           n.RecipientId == userId &&
                           n.RecipientType == userType)
                .FirstOrDefaultAsync();

            if (notification == null)
            {
                return NotFound(new { Message = "Notification not found" });
            }
            if (notification.IsRead != true)
            {
                notification.IsRead = true;
                notification.ReadAt = TimeZoneHelper.GetVietnamNow();

                await _context.SaveChangesAsync();
            }

            return Ok(new { Message = "Notification marked as read" });
        }

        [HttpPut("mark-all-read")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized();

            var userType = GetCurrentUserType();
            if (userType == null)
                return Unauthorized();

            var unreadNotifications = await _context.Notifications
                .Where(n => n.RecipientId == userId &&
                           n.RecipientType == userType &&
                           n.IsRead == false)
                .ToListAsync();

            if (unreadNotifications.Any())
            {
                foreach (var notification in unreadNotifications)
                {
                    notification.IsRead = true;
                    notification.ReadAt = TimeZoneHelper.GetVietnamNow();
                    notification.UpdatedAt = TimeZoneHelper.GetVietnamNow();
                }

                await _context.SaveChangesAsync();
            }

            return Ok(new
            {
                Message = "All notifications marked as read",
                UpdatedCount = unreadNotifications.Count
            });
        }

        // DELETE: api/notification/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNotification(int id)
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized();

            var userType = GetCurrentUserType();
            if (userType == null)
                return Unauthorized();

            var notification = await _context.Notifications
                .Where(n => n.Id == id &&
                           n.RecipientId == userId &&
                           n.RecipientType == userType)
                .FirstOrDefaultAsync();

            if (notification == null)
            {
                return NotFound(new { Message = "Notification not found" });
            }

            _context.Notifications.Remove(notification);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Notification deleted successfully" });
        }

        // POST: api/notification (For admin/system use)
        [HttpPost]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<object>> CreateNotification([FromBody] CreateNotificationDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Verify recipient exists
            var recipient = await _context.Users.FindAsync(dto.RecipientId);
            if (recipient == null)
            {
                return BadRequest(new { Message = "Recipient not found" });
            }

            // Verify sender exists if provided
            if (dto.SenderId.HasValue)
            {
                var sender = await _context.Users.FindAsync(dto.SenderId);
                if (sender == null)
                {
                    return BadRequest(new { Message = "Sender not found" });
                }
            }
            var notification = new Notification
            {
                RecipientId = dto.RecipientId,
                RecipientType = dto.RecipientType,
                SenderId = dto.SenderId,
                SenderType = dto.SenderType ?? "system",
                Type = dto.Type,
                Title = dto.Title,
                Message = dto.Message,
                Data = dto.Data,
                IsRead = false,
                CreatedAt = TimeZoneHelper.GetVietnamNow(),
                UpdatedAt = TimeZoneHelper.GetVietnamNow()
            };

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetNotification),
                new { id = notification.Id },
                new
                {
                    notification.Id,
                    notification.Type,
                    notification.Title,
                    notification.Message,
                    notification.CreatedAt
                });
        }

        // Helper methods
        private int? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            Console.WriteLine($"[DEBUG] ClaimTypes.NameIdentifier = '{userIdClaim}'");
            return int.TryParse(userIdClaim, out int userId) ? userId : null;
        }


        private string? GetCurrentUserType()
        {
            var roleClaim = User.FindFirst(ClaimTypes.Role)?.Value;
            if (roleClaim == null) return null;
            return roleClaim switch
            {
                "candidate" => "candidate",
                "employer" => "employer",
                "admin" => "admin",
                _ => null
            };
        }
    }

    // DTO for creating notifications
    public class CreateNotificationDto
    {
        public int RecipientId { get; set; }
        public string RecipientType { get; set; } = null!;
        public int? SenderId { get; set; }
        public string? SenderType { get; set; }
        public string Type { get; set; } = null!;
        public string Title { get; set; } = null!;
        public string Message { get; set; } = null!;
        public string? Data { get; set; }
    }
}