using System;
using System.Collections.Generic;

namespace BACKEND.Models;

public partial class JobPostField
{
    public int JobPostId { get; set; }

    public int FieldId { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual JobField Field { get; set; } = null!;

    public virtual JobPost JobPost { get; set; } = null!;
}
