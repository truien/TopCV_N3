using System;
using System.Collections.Generic;

namespace BACKEND.Models;

public partial class UserFollow
{
    public int UserId { get; set; }

    public int EmployerId { get; set; }

    public DateTime? FollowedAt { get; set; }

    public virtual User Employer { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
