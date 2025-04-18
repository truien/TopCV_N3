﻿using System;
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

    public virtual ICollection<Application> Applications { get; set; } = new List<Application>();

    public virtual ICollection<CandidateProfile> CandidateProfiles { get; set; } = new List<CandidateProfile>();

    public virtual ICollection<CompanyProfile> CompanyProfiles { get; set; } = new List<CompanyProfile>();

    public virtual ICollection<Interview> InterviewCandidateUsers { get; set; } = new List<Interview>();

    public virtual ICollection<Interview> InterviewEmployers { get; set; } = new List<Interview>();

    public virtual ICollection<JobPostReport> JobPostReports { get; set; } = new List<JobPostReport>();

    public virtual ICollection<JobPostReview> JobPostReviews { get; set; } = new List<JobPostReview>();

    public virtual ICollection<JobPost> JobPosts { get; set; } = new List<JobPost>();

    public virtual ICollection<ProSubscription> ProSubscriptions { get; set; } = new List<ProSubscription>();

    public virtual UserRole Role { get; set; } = null!;

    public virtual ICollection<SavedJob> SavedJobs { get; set; } = new List<SavedJob>();

    public virtual ICollection<UserFollow> UserFollowEmployers { get; set; } = new List<UserFollow>();

    public virtual ICollection<UserFollow> UserFollowUsers { get; set; } = new List<UserFollow>();

    public virtual ICollection<Warning> Warnings { get; set; } = new List<Warning>();
}
