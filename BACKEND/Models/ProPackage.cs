using System;
using System.Collections.Generic;

namespace BACKEND.Models;

public partial class ProPackage
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public string? Description { get; set; }

    public decimal Price { get; set; }

    public int DurationDays { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();

    public virtual ICollection<ProSubscription> ProSubscriptions { get; set; } = new List<ProSubscription>();
}
