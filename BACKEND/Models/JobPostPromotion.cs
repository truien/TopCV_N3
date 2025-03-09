using System;
using System.Collections.Generic;

namespace BACKEND.Models;

public partial class JobPostPromotion
{
    public int Id { get; set; }

    public int JobPostId { get; set; }

    public int PackageId { get; set; }

    public DateTime StartDate { get; set; }

    public DateTime EndDate { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual JobPost JobPost { get; set; } = null!;

    public virtual Package Package { get; set; } = null!;
}
