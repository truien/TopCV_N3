using BACKEND.Hubs;
using BACKEND.Models;
using BACKEND.Utils;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

public class NotificationService
{
    private readonly TopcvBeContext _context;
    private readonly IHubContext<NotificationHub> _hub;

    public NotificationService(
        TopcvBeContext context,
        IHubContext<NotificationHub> hubContext)
    {
        _context = context;
        _hub = hubContext;
    }
    public async Task<List<Notification>> GetNotificationsByUserAsync(int userId, string userType)
    {
        return await _context.Notifications
            .Where(n => n.RecipientId == userId && n.RecipientType == userType)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync();
    }

    // Get notifications with pagination and filters
    public async Task<(List<object> Notifications, int TotalCount)> GetNotificationsWithPaginationAsync(
        int userId,
        string userType,
        int page = 1,
        int pageSize = 10,
        string? type = null,
        bool? isRead = null)
    {
        var query = _context.Notifications
            .Where(n => n.RecipientId == userId && n.RecipientType == userType)
            .Include(n => n.Sender)
            .AsQueryable();

        if (!string.IsNullOrEmpty(type))
        {
            query = query.Where(n => n.Type == type);
        }

        if (isRead.HasValue)
        {
            query = query.Where(n => n.IsRead == isRead);
        }

        // Get total count for pagination
        var totalCount = await query.CountAsync();

        // Apply pagination and ordering
        var notifications = await query
            .OrderByDescending(n => n.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(n => new
            {
                n.Id,
                n.Type,
                n.Title,
                n.Message,
                n.Data,
                n.IsRead,
                n.ReadAt,
                n.CreatedAt,
                Sender = n.Sender != null ? new
                {
                    n.Sender.Id,
                    n.Sender.Username,
                    n.Sender.Avatar
                } : null
            })
            .ToListAsync();

        return (notifications.Cast<object>().ToList(), totalCount);
    }

    // Create application notification for employer
    public async Task CreateApplicationNotificationAsync(int jobId, int candidateId)
    {
        var job = await _context.JobPosts.FindAsync(jobId);
        var candidate = await _context.Users.FindAsync(candidateId);

        if (job != null && candidate != null)
        {
            var notification = new Notification
            {
                RecipientId = job.EmployerId,
                RecipientType = "employer",
                SenderId = candidateId,
                SenderType = "candidate",
                Type = "NEW_APPLICATION",
                Title = "Đơn ứng tuyển mới",
                Message = $"Bạn có đơn ứng tuyển mới từ {candidate.Username} cho vị trí \"{job.Title}\"",
                Data = JsonSerializer.Serialize(new
                {
                    job_id = jobId,
                    candidate_id = candidateId,
                    candidate_name = candidate.Username,
                    job_title = job.Title
                }),
                IsRead = false,
                CreatedAt = TimeZoneHelper.GetVietnamNow(),
                UpdatedAt = TimeZoneHelper.GetVietnamNow()
            }; _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();

            // Chuẩn bị dữ liệu thông báo để gửi qua SignalR
            var dto = new
            {
                Id = notification.Id,
                Type = notification.Type,
                Title = notification.Title,
                Message = notification.Message,
                Data = notification.Data,
                IsRead = notification.IsRead,
                CreatedAt = notification.CreatedAt,
                Sender = notification.SenderId.HasValue ? new
                {
                    Id = candidate.Id,
                    Username = candidate.Username,
                    Avatar = candidate.Avatar
                } : null
            };

            // Gửi thông báo qua SignalR sử dụng group
            string groupName = $"user_{notification.RecipientId}_{notification.RecipientType}";
            await _hub.Clients.Group(groupName).SendAsync("ReceiveNotification", dto);

            // Cập nhật số lượng thông báo chưa đọc
            int unreadCount = await _context.Notifications
                .CountAsync(n => n.RecipientId == notification.RecipientId &&
                            n.RecipientType == notification.RecipientType &&
                            n.IsRead != true);

            await _hub.Clients.Group(groupName).SendAsync("UnreadCountUpdated", unreadCount);
        }
    }    // Create application status notification for candidate
    public async Task CreateApplicationStatusNotificationAsync(int applicationId, string status)
    {
        var application = await _context.Applications
            .Include(a => a.Job)
            .Include(a => a.User)
            .FirstOrDefaultAsync(a => a.Id == applicationId);

        if (application != null)
        {
            var statusMessage = status switch
            {
                "Accepted" => "đã được chấp nhận",
                "Rejected" => "đã bị từ chối",
                _ => "đã được cập nhật"
            };

            var notification = new Notification
            {
                RecipientId = application.UserId,
                RecipientType = "candidate",
                SenderId = application.Job.EmployerId,
                SenderType = "employer",
                Type = "APPLICATION_STATUS_UPDATE",
                Title = "Cập nhật trạng thái ứng tuyển",
                Message = $"Đơn ứng tuyển cho vị trí \"{application.Job.Title}\" {statusMessage}",
                Data = JsonSerializer.Serialize(new
                {
                    application_id = applicationId,
                    job_id = application.JobId,
                    job_title = application.Job.Title,
                    status = status
                }),
                IsRead = false,
                CreatedAt = TimeZoneHelper.GetVietnamNow(),
                UpdatedAt = TimeZoneHelper.GetVietnamNow()
            };

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();

            // Chuẩn bị dữ liệu thông báo để gửi qua SignalR
            var dto = new
            {
                Id = notification.Id,
                Type = notification.Type,
                Title = notification.Title,
                Message = notification.Message,
                Data = notification.Data,
                IsRead = notification.IsRead,
                CreatedAt = notification.CreatedAt,
                Sender = notification.SenderId.HasValue ? new
                {
                    Id = application.Job.Employer?.Id,
                    Username = application.Job.Employer?.Username,
                    Avatar = application.Job.Employer?.Avatar
                } : null
            };

            // Gửi thông báo qua SignalR sử dụng group
            string groupName = $"user_{notification.RecipientId}_{notification.RecipientType}";
            await _hub.Clients.Group(groupName).SendAsync("ReceiveNotification", dto);

            // Cập nhật số lượng thông báo chưa đọc
            int unreadCount = await _context.Notifications
                .CountAsync(n => n.RecipientId == notification.RecipientId &&
                            n.RecipientType == notification.RecipientType &&
                            n.IsRead != true);

            await _hub.Clients.Group(groupName).SendAsync("UnreadCountUpdated", unreadCount);
        }
    }    // Create follow notification for employer
    public async Task CreateFollowNotificationAsync(int followerId, int employerId)
    {
        var follower = await _context.Users.FindAsync(followerId);
        var employer = await _context.Users
            .Include(u => u.CompanyProfiles)
            .FirstOrDefaultAsync(u => u.Id == employerId);

        if (follower != null && employer != null)
        {
            var companyName = employer.CompanyProfiles.FirstOrDefault()?.CompanyName ?? employer.Username;

            var notification = new Notification
            {
                RecipientId = employerId,
                RecipientType = "employer",
                SenderId = followerId,
                SenderType = "candidate",
                Type = "NEW_FOLLOWER",
                Title = "Người theo dõi mới",
                Message = $"{follower.Username} đã bắt đầu theo dõi công ty {companyName}",
                Data = JsonSerializer.Serialize(new
                {
                    follower_id = followerId,
                    follower_name = follower.Username,
                    company_id = employerId,
                    company_name = companyName
                }),
                IsRead = false,
                CreatedAt = TimeZoneHelper.GetVietnamNow(),
                UpdatedAt = TimeZoneHelper.GetVietnamNow()
            };

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();

            // Chuẩn bị dữ liệu thông báo để gửi qua SignalR
            var dto = new
            {
                Id = notification.Id,
                Type = notification.Type,
                Title = notification.Title,
                Message = notification.Message,
                Data = notification.Data,
                IsRead = notification.IsRead,
                CreatedAt = notification.CreatedAt,
                Sender = notification.SenderId.HasValue ? new
                {
                    Id = follower.Id,
                    Username = follower.Username,
                    Avatar = follower.Avatar
                } : null
            };

            // Gửi thông báo qua SignalR sử dụng group
            string groupName = $"user_{notification.RecipientId}_{notification.RecipientType}";
            await _hub.Clients.Group(groupName).SendAsync("ReceiveNotification", dto);

            // Cập nhật số lượng thông báo chưa đọc
            int unreadCount = await _context.Notifications
                .CountAsync(n => n.RecipientId == notification.RecipientId &&
                            n.RecipientType == notification.RecipientType &&
                            n.IsRead != true);

            await _hub.Clients.Group(groupName).SendAsync("UnreadCountUpdated", unreadCount);
        }
    }    // Create interview notification for candidate
    public async Task CreateInterviewNotificationAsync(int interviewId, int candidateId)
    {
        var interview = await _context.Interviews
            .Include(i => i.Application)
                .ThenInclude(a => a.Job)
                    .ThenInclude(j => j.Employer)
                        .ThenInclude(e => e.CompanyProfiles)
            .FirstOrDefaultAsync(i => i.Id == interviewId);

        if (interview != null)
        {
            var companyName = interview.Application.Job.Employer.CompanyProfiles.FirstOrDefault()?.CompanyName ?? interview.Application.Job.Employer.Username;

            var notification = new Notification
            {
                RecipientId = candidateId,
                RecipientType = "candidate",
                SenderId = interview.Application.Job.EmployerId,
                SenderType = "employer",
                Type = "INTERVIEW_INVITATION",
                Title = "Lời mời phỏng vấn",
                Message = $"Bạn được mời phỏng vấn cho vị trí \"{interview.Application.Job.Title}\" tại {companyName}",
                Data = JsonSerializer.Serialize(new
                {
                    interview_id = interviewId,
                    application_id = interview.ApplicationId,
                    job_id = interview.Application.JobId,
                    job_title = interview.Application.Job.Title,
                    company_name = companyName,
                    interview_date = interview.CreatedAt
                }),
                IsRead = false,
                CreatedAt = TimeZoneHelper.GetVietnamNow(),
                UpdatedAt = TimeZoneHelper.GetVietnamNow()
            };

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();

            // Chuẩn bị dữ liệu thông báo để gửi qua SignalR
            var dto = new
            {
                Id = notification.Id,
                Type = notification.Type,
                Title = notification.Title,
                Message = notification.Message,
                Data = notification.Data,
                IsRead = notification.IsRead,
                CreatedAt = notification.CreatedAt,
                Sender = notification.SenderId.HasValue ? new
                {
                    Id = interview.Application.Job.Employer?.Id,
                    Username = interview.Application.Job.Employer?.Username,
                    Avatar = interview.Application.Job.Employer?.Avatar
                } : null
            };

            // Gửi thông báo qua SignalR sử dụng group
            string groupName = $"user_{notification.RecipientId}_{notification.RecipientType}";
            await _hub.Clients.Group(groupName).SendAsync("ReceiveNotification", dto);

            // Cập nhật số lượng thông báo chưa đọc
            int unreadCount = await _context.Notifications
                .CountAsync(n => n.RecipientId == notification.RecipientId &&
                            n.RecipientType == notification.RecipientType &&
                            n.IsRead != true);

            await _hub.Clients.Group(groupName).SendAsync("UnreadCountUpdated", unreadCount);
        }
    }    // Create report notification for admins
    public async Task CreateReportNotificationAsync(int reportId, int reporterId)
    {
        var report = await _context.JobPostReports
            .Include(r => r.JobPost)
            .Include(r => r.ReportedByNavigation)
            .FirstOrDefaultAsync(r => r.Id == reportId);

        if (report != null)
        {
            // Get all admin users
            var adminUsers = await _context.Users
                .Include(u => u.Role)
                .Where(u => u.Role.Name == "admin")
                .ToListAsync();

            var notifications = new List<Notification>();

            foreach (var admin in adminUsers)
            {
                var notification = new Notification
                {
                    RecipientId = admin.Id,
                    RecipientType = "admin",
                    SenderId = reporterId,
                    SenderType = "user",
                    Type = "NEW_REPORT",
                    Title = "Báo cáo mới",
                    Message = $"Có báo cáo mới cho bài viết \"{report.JobPost.Title}\" với lý do: {report.Reason}",
                    Data = JsonSerializer.Serialize(new
                    {
                        report_id = reportId,
                        job_id = report.JobPostId,
                        job_title = report.JobPost.Title,
                        reason = report.Reason,
                        reporter_username = report.ReportedByNavigation.Username
                    }),
                    IsRead = false,
                    CreatedAt = TimeZoneHelper.GetVietnamNow(),
                    UpdatedAt = TimeZoneHelper.GetVietnamNow()
                };

                _context.Notifications.Add(notification);
                notifications.Add(notification);
            }

            // Lưu tất cả thông báo một lần
            await _context.SaveChangesAsync();

            // Gửi thông báo đến từng admin riêng biệt
            foreach (var notification in notifications)
            {
                // Chuẩn bị dữ liệu thông báo để gửi qua SignalR
                var dto = new
                {
                    Id = notification.Id,
                    Type = notification.Type,
                    Title = notification.Title,
                    Message = notification.Message,
                    Data = notification.Data,
                    IsRead = notification.IsRead,
                    CreatedAt = notification.CreatedAt,
                    Sender = notification.SenderId.HasValue ? new
                    {
                        Id = report.ReportedByNavigation.Id,
                        Username = report.ReportedByNavigation.Username,
                        Avatar = report.ReportedByNavigation.Avatar
                    } : null
                };

                // Gửi thông báo qua SignalR sử dụng group
                string groupName = $"user_{notification.RecipientId}_{notification.RecipientType}";
                await _hub.Clients.Group(groupName).SendAsync("ReceiveNotification", dto);

                // Cập nhật số lượng thông báo chưa đọc cho từng admin
                int unreadCount = await _context.Notifications
                    .CountAsync(n => n.RecipientId == notification.RecipientId &&
                                n.RecipientType == notification.RecipientType &&
                                n.IsRead != true); await _hub.Clients.Group(groupName).SendAsync("UnreadCountUpdated", unreadCount);
            }
        }
    }

    // Create notification to employer about their job post being reported
    public async Task CreateJobReportNotificationAsync(int reportId, int employerId, string jobTitle, string reason)
    {
        var employer = await _context.Users.FindAsync(employerId);
        if (employer != null)
        {
            var reasonText = reason switch
            {
                "inappropriate_content" => "Nội dung không phù hợp",
                "fake_job" => "Việc làm giả",
                "spam" => "Spam",
                "discrimination" => "Phân biệt đối xử",
                "other" => "Khác",
                _ => reason
            };

            var notification = new Notification
            {
                RecipientId = employerId,
                RecipientType = "employer",
                SenderId = null, // Admin notification
                SenderType = "admin",
                Type = "JOB_REPORTED",
                Title = "Thông báo về bài đăng của bạn",
                Message = $"Bài đăng \"{jobTitle}\" của bạn đã bị báo cáo với lý do: {reasonText}. Vui lòng kiểm tra và cập nhật nội dung nếu cần thiết.",
                Data = JsonSerializer.Serialize(new
                {
                    report_id = reportId,
                    job_title = jobTitle,
                    reason = reason,
                    reason_text = reasonText
                }),
                IsRead = false,
                CreatedAt = TimeZoneHelper.GetVietnamNow(),
                UpdatedAt = TimeZoneHelper.GetVietnamNow()
            };

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();

            // Prepare notification data for SignalR
            var dto = new
            {
                Id = notification.Id,
                Type = notification.Type,
                Title = notification.Title,
                Message = notification.Message,
                Data = notification.Data,
                IsRead = notification.IsRead,
                CreatedAt = notification.CreatedAt,
                Sender = (object?)null // Admin notification
            };

            // Send notification via SignalR
            string groupName = $"user_{notification.RecipientId}_{notification.RecipientType}";
            await _hub.Clients.Group(groupName).SendAsync("ReceiveNotification", dto);

            // Update unread count
            int unreadCount = await _context.Notifications
                .CountAsync(n => n.RecipientId == notification.RecipientId &&
                            n.RecipientType == notification.RecipientType &&
                            n.IsRead != true);

            await _hub.Clients.Group(groupName).SendAsync("UnreadCountUpdated", unreadCount);
        }
    }

    // Mark notification as read
    public async Task MarkAsReadAsync(int notificationId)
    {
        var notification = await _context.Notifications.FindAsync(notificationId);
        if (notification != null)
        {
            notification.IsRead = true;
            notification.ReadAt = TimeZoneHelper.GetVietnamNow();
            notification.UpdatedAt = TimeZoneHelper.GetVietnamNow();
            await _context.SaveChangesAsync();

            // Cập nhật số lượng thông báo chưa đọc qua SignalR
            string groupName = $"user_{notification.RecipientId}_{notification.RecipientType}";
            int unreadCount = await _context.Notifications
                .CountAsync(n => n.RecipientId == notification.RecipientId &&
                            n.RecipientType == notification.RecipientType &&
                            n.IsRead != true);

            await _hub.Clients.Group(groupName).SendAsync("UnreadCountUpdated", unreadCount);
        }
    }

    // Mark all notifications as read for a user
    public async Task MarkAllAsReadAsync(int userId, string userType)
    {
        var notifications = await _context.Notifications
            .Where(n => n.RecipientId == userId && n.RecipientType == userType && n.IsRead != true)
            .ToListAsync();

        foreach (var notification in notifications)
        {
            notification.IsRead = true;
            notification.ReadAt = TimeZoneHelper.GetVietnamNow();
            notification.UpdatedAt = TimeZoneHelper.GetVietnamNow();
        }

        await _context.SaveChangesAsync();

        // Cập nhật số lượng thông báo chưa đọc qua SignalR (bây giờ là 0)
        string groupName = $"user_{userId}_{userType}";
        await _hub.Clients.Group(groupName).SendAsync("UnreadCountUpdated", 0);
    }

    // Get unread notification count
    public async Task<int> GetUnreadCountAsync(int userId, string userType)
    {
        return await _context.Notifications
            .CountAsync(n => n.RecipientId == userId && n.RecipientType == userType && n.IsRead != true);
    }

    // Delete notification
    public async Task DeleteNotificationAsync(int notificationId)
    {
        var notification = await _context.Notifications.FindAsync(notificationId);
        if (notification != null)
        {
            _context.Notifications.Remove(notification);
            await _context.SaveChangesAsync();
        }
    }
}
