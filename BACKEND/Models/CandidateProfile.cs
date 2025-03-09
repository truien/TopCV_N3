using System;
using System.Collections.Generic;

namespace BACKEND.Models;

public partial class CandidateProfile
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public string? Phone { get; set; }

    public string? Address { get; set; }

    public DateOnly? DateOfBirth { get; set; }

    public string? Gender { get; set; }

    public string? Summary { get; set; }

    public string? Experience { get; set; }

    public string? Education { get; set; }

    public string? Skills { get; set; }

    public string? CvTitle { get; set; }

    public string? CvFilePath { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual User User { get; set; } = null!;
}
