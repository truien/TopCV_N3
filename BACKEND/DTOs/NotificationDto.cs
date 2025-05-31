using System.ComponentModel.DataAnnotations;

namespace BACKEND.DTOs
{
    public class CreateNotificationDto
    {
        [Required]
        public int RecipientId { get; set; }

        [Required]
        [RegularExpression("^(candidate|employer|admin)$", ErrorMessage = "RecipientType must be 'candidate', 'employer', or 'admin'")]
        public string RecipientType { get; set; } = null!;

        public int? SenderId { get; set; }

        [RegularExpression("^(candidate|employer|admin|system)$", ErrorMessage = "SenderType must be 'candidate', 'employer', 'admin', or 'system'")]
        public string? SenderType { get; set; }

        [Required]
        [StringLength(50)]
        public string Type { get; set; } = null!;

        [Required]
        [StringLength(255)]
        public string Title { get; set; } = null!;

        [Required]
        public string Message { get; set; } = null!;

        public string? Data { get; set; }
    }

    public class NotificationResponseDto
    {
        public int Id { get; set; }
        public string Type { get; set; } = null!;
        public string Title { get; set; } = null!;
        public string Message { get; set; } = null!;
        public string? Data { get; set; }
        public bool? IsRead { get; set; }
        public DateTime? ReadAt { get; set; }
        public DateTime? CreatedAt { get; set; }
        public SenderDto? Sender { get; set; }
    }

    public class SenderDto
    {
        public int Id { get; set; }
        public string Username { get; set; } = null!;
        public string? Avatar { get; set; }
    }

    public class NotificationListResponseDto
    {
        public List<NotificationResponseDto> Data { get; set; } = new();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
    }

    public class UnreadCountResponseDto
    {
        public int UnreadCount { get; set; }
    }
}
