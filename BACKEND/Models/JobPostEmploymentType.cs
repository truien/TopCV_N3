using System;
using System.Collections.Generic;

namespace BACKEND.Models;

public partial class JobPostEmploymentType
{
    public int JobPostId { get; set; }

    public int EmploymentTypeId { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual EmploymentType EmploymentType { get; set; } = null!;

    public virtual JobPost JobPost { get; set; } = null!;
}
