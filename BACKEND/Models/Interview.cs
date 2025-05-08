using System;
using System.Collections.Generic;

namespace BACKEND.Models;

public partial class Interview
{
    public int Id { get; set; }

    public int JobId { get; set; }

    public int? CandidateUserId { get; set; }

    public int EmployerId { get; set; }

    public string? Status { get; set; }

    public DateTime? CreatedAt { get; set; }

    public string Message { get; set; } = null!;

    public string? SecureToken { get; set; }

    public virtual User? CandidateUser { get; set; }

    public virtual User Employer { get; set; } = null!;

    public virtual JobPost Job { get; set; } = null!;
}
