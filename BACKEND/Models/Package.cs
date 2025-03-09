using System;
using System.Collections.Generic;

namespace BACKEND.Models;

public partial class Package
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public string? Description { get; set; }

    public decimal Price { get; set; }

    public int DurationDays { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual ICollection<JobPostPromotion> JobPostPromotions { get; set; } = new List<JobPostPromotion>();
}
