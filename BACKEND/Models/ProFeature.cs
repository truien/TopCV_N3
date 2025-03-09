using System;
using System.Collections.Generic;

namespace BACKEND.Models;

public partial class ProFeature
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public string? Description { get; set; }

    public virtual ICollection<ProSubscriptionFeature> ProSubscriptionFeatures { get; set; } = new List<ProSubscriptionFeature>();
}
