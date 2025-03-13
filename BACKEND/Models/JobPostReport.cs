using System;
using System.Collections.Generic;

namespace BACKEND.Models;

public partial class JobPostReport
{
    public int Id { get; set; }

    public int JobPostId { get; set; }

    public int ReportedBy { get; set; }

    public string Reason { get; set; } = null!;

    public string? Status { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual JobPost JobPost { get; set; } = null!;

    public virtual User ReportedByNavigation { get; set; } = null!;
}
