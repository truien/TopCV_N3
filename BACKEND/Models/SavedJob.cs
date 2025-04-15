using System;
using System.Collections.Generic;

namespace BACKEND.Models;

public partial class SavedJob
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public int JobPostId { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual JobPost JobPost { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
