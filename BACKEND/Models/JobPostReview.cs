using System;
using System.Collections.Generic;

namespace BACKEND.Models;

public partial class JobPostReview
{
    public int Id { get; set; }

    public int JobPostId { get; set; }

    public int UserId { get; set; }

    public sbyte Rating { get; set; }

    public string? Comment { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual JobPost JobPost { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
