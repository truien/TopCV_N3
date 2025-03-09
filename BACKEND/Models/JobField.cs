using System;
using System.Collections.Generic;

namespace BACKEND.Models;

public partial class JobField
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public virtual ICollection<JobPostField> JobPostFields { get; set; } = new List<JobPostField>();
}
