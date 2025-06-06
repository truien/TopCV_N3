// UpdateProfileDto.cs
namespace BACKEND.DTOs
{
    public class UpdateProfileDto
    {
        public string? Username { get; set; }
        public string? DisplayName { get; set; }

        // Candidate fields
        public string? Fullname { get; set; }
        public string? Phone { get; set; }
        public string? Address { get; set; }
        public string? DateOfBirth { get; set; }

        // Company fields  
        public string? CompanyName { get; set; }
        public string? Description { get; set; }
        public string? Website { get; set; }
        public string? Location { get; set; }
    }

    public class ChangePasswordDto
    {
        public string CurrentPassword { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }

    public class NotificationSettingsDto
    {
        public bool EmailNotifications { get; set; }
        public bool JobAlerts { get; set; }
        public bool SystemNotifications { get; set; }
        public bool MarketingEmails { get; set; }
    }

    public class PrivacySettingsDto
    {
        public string ProfileVisibility { get; set; } = "public";
        public bool SearchVisibility { get; set; }
        public bool AllowMessages { get; set; }
    }

    public class ThemeSettingsDto
    {
        public string Theme { get; set; } = "light";
        public string Language { get; set; } = "vi";
    }
}
