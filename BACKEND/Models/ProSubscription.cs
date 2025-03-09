using System;
using System.Collections.Generic;

namespace BACKEND.Models;

public partial class ProSubscription
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public DateTime StartDate { get; set; }

    public DateTime EndDate { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual ICollection<ProSubscriptionFeature> ProSubscriptionFeatures { get; set; } = new List<ProSubscriptionFeature>();

    public virtual User User { get; set; } = null!;
}
