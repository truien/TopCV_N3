using System;
using System.Collections.Generic;

namespace BACKEND.Models;

public partial class JobPost
{
    public int Id { get; set; }

    public string Title { get; set; } = null!;

    public string Description { get; set; } = null!;

    public string Requirements { get; set; } = null!;

    public string Interest { get; set; } = null!;

    public string? SalaryRange { get; set; }

    public string? Location { get; set; }

    public DateTime? PostDate { get; set; }

    public string? Status { get; set; }

    public int EmployerId { get; set; }

    public virtual ICollection<Application> Applications { get; set; } = new List<Application>();

    public virtual User Employer { get; set; } = null!;

    public virtual ICollection<Interview> Interviews { get; set; } = new List<Interview>();

    public virtual ICollection<JobPostEmploymentType> JobPostEmploymentTypes { get; set; } = new List<JobPostEmploymentType>();

    public virtual ICollection<JobPostField> JobPostFields { get; set; } = new List<JobPostField>();

    public virtual ICollection<JobPostPromotion> JobPostPromotions { get; set; } = new List<JobPostPromotion>();

    public virtual ICollection<JobPostReport> JobPostReports { get; set; } = new List<JobPostReport>();

    public virtual ICollection<JobPostReview> JobPostReviews { get; set; } = new List<JobPostReview>();

    public virtual ICollection<Warning> Warnings { get; set; } = new List<Warning>();
}
