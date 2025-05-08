using System;
using System.Collections.Generic;

namespace BACKEND.Models;

public partial class CompanyProfile
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public string CompanyName { get; set; } = null!;

    public string Slug { get; set; } = null!;

    public string? Description { get; set; }

    public string? Website { get; set; }

    public string? Location { get; set; }

    public virtual User User { get; set; } = null!;
}
