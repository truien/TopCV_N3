using System;
using System.Collections.Generic;

namespace BACKEND.Models;

public partial class Application
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public int JobId { get; set; }

    public string? CvFile { get; set; }

    public DateTime? AppliedAt { get; set; }

    public virtual JobPost Job { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
