using System;
using System.Collections.Generic;

namespace BACKEND.Models;

public partial class User
{
    public int Id { get; set; }

    public string Username { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string? Password { get; set; }

    public string? Avatar { get; set; }

    public string? GoogleId { get; set; }

    public string? FacebookId { get; set; }

    public DateTime? CreatedAt { get; set; }

    public int RoleId { get; set; }

    public virtual AdminUser? AdminUser { get; set; }

    public virtual ICollection<Application> Applications { get; set; } = new List<Application>();

    public virtual ICollection<CandidateProfile> CandidateProfiles { get; set; } = new List<CandidateProfile>();

    public virtual ICollection<CompanyProfile> CompanyProfiles { get; set; } = new List<CompanyProfile>();

    public virtual ICollection<JobPost> JobPosts { get; set; } = new List<JobPost>();

    public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();

    public virtual ICollection<ProSubscription> ProSubscriptions { get; set; } = new List<ProSubscription>();

    public virtual UserRole Role { get; set; } = null!;

    public virtual ICollection<UserFollow> UserFollowEmployers { get; set; } = new List<UserFollow>();

    public virtual ICollection<UserFollow> UserFollowUsers { get; set; } = new List<UserFollow>();
}
