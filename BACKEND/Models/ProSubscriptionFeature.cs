using System;
using System.Collections.Generic;

namespace BACKEND.Models;

public partial class ProSubscriptionFeature
{
    public int ProSubscriptionId { get; set; }

    public int ProFeatureId { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual ProFeature ProFeature { get; set; } = null!;

    public virtual ProSubscription ProSubscription { get; set; } = null!;
}
