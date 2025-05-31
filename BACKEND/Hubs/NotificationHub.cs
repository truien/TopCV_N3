using System.Security.Claims;
using System.Threading.Tasks;
using BACKEND.Models;
using BACKEND.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace BACKEND.Hubs
{
    [Authorize]
    public class NotificationHub : Hub
    {
        private readonly TopcvBeContext _context;

        public NotificationHub(TopcvBeContext context)
        {
            _context = context;
        }

        public override async Task OnConnectedAsync()
        {
            var userId = GetCurrentUserId();
            var userType = GetCurrentUserType();

            if (userId != null && userType != null)
            {
                // Thêm người dùng vào nhóm theo ID và loại
                await Groups.AddToGroupAsync(Context.ConnectionId, $"user_{userId}_{userType}");

                // Gửi số lượng thông báo chưa đọc ngay khi kết nối
                if (int.TryParse(userId, out int userIdInt))
                {
                    int unreadCount = await _context.Notifications
                        .CountAsync(n => n.RecipientId == userIdInt &&
                                       n.RecipientType == userType &&
                                       n.IsRead == false);

                    await Clients.Caller.SendAsync("UnreadCountUpdated", unreadCount);
                }
            }

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = GetCurrentUserId();
            var userType = GetCurrentUserType();

            if (userId != null && userType != null)
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"user_{userId}_{userType}");
            }

            await base.OnDisconnectedAsync(exception);
        }

        // Đánh dấu thông báo đã đọc
        public async Task MarkAsRead(int notificationId)
        {
            var userId = GetCurrentUserId();
            var userType = GetCurrentUserType();

            if (userId != null && userType != null && int.TryParse(userId, out int userIdInt))
            {
                var notification = await _context.Notifications
                    .FirstOrDefaultAsync(n => n.Id == notificationId &&
                                            n.RecipientId == userIdInt &&
                                            n.RecipientType == userType);

                if (notification != null && notification.IsRead != true)
                {
                    notification.IsRead = true;
                    notification.ReadAt = TimeZoneHelper.GetVietnamNow();
                    notification.UpdatedAt = TimeZoneHelper.GetVietnamNow();
                    await _context.SaveChangesAsync();

                    // Cập nhật số lượng thông báo chưa đọc
                    int unreadCount = await _context.Notifications
                        .CountAsync(n => n.RecipientId == userIdInt &&
                                       n.RecipientType == userType &&
                                       n.IsRead == false);

                    await Clients.Caller.SendAsync("UnreadCountUpdated", unreadCount);
                }
            }
        }

        // Đánh dấu tất cả thông báo đã đọc
        public async Task MarkAllAsRead()
        {
            var userId = GetCurrentUserId();
            var userType = GetCurrentUserType();

            if (userId != null && userType != null && int.TryParse(userId, out int userIdInt))
            {
                var notifications = await _context.Notifications
                    .Where(n => n.RecipientId == userIdInt &&
                          n.RecipientType == userType &&
                          n.IsRead != true)
                    .ToListAsync();

                if (notifications.Any())
                {
                    foreach (var notification in notifications)
                    {
                        notification.IsRead = true;
                        notification.ReadAt = TimeZoneHelper.GetVietnamNow();
                        notification.UpdatedAt = TimeZoneHelper.GetVietnamNow();
                    }

                    await _context.SaveChangesAsync();

                    // Cập nhật số lượng thông báo chưa đọc (bây giờ là 0)
                    await Clients.Caller.SendAsync("UnreadCountUpdated", 0);
                }
            }
        }

        // Helper methods
        private string? GetCurrentUserId()
        {
            return Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        }

        private string? GetCurrentUserType()
        {
            var roleClaim = Context.User?.FindFirst(ClaimTypes.Role)?.Value;
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
}
