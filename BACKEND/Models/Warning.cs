using System;
using System.Collections.Generic;

namespace BACKEND.Models;

public partial class Warning
{
    public int Id { get; set; }

    public int EmployerId { get; set; }

    public int JobPostId { get; set; }

    public string WarningMessage { get; set; } = null!;

    public DateTime? CreatedAt { get; set; }

    public virtual User Employer { get; set; } = null!;

    public virtual JobPost JobPost { get; set; } = null!;
}
