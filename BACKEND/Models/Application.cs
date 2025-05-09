﻿using System;
using System.Collections.Generic;

namespace BACKEND.Models;

public partial class Application
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public int JobId { get; set; }

    public string? CvFile { get; set; }

    public DateTime? AppliedAt { get; set; }

    public int Status { get; set; }

    public string? RejectReason { get; set; }

    public virtual ICollection<Interview> Interviews { get; set; } = new List<Interview>();

    public virtual JobPost Job { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
