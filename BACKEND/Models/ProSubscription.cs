using System;
using System.Collections.Generic;

namespace BACKEND.Models;

public partial class ProSubscription
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public int PackageId { get; set; }

    public DateTime StartDate { get; set; }

    public DateTime EndDate { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual ProPackage Package { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
