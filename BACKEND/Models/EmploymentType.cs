using System;
using System.Collections.Generic;

namespace BACKEND.Models;

public partial class EmploymentType
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public virtual ICollection<JobPostEmploymentType> JobPostEmploymentTypes { get; set; } = new List<JobPostEmploymentType>();
}
