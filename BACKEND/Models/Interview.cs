using System;
using System.Collections.Generic;

namespace BACKEND.Models;

public partial class Interview
{
    public int Id { get; set; }

    public string? Status { get; set; }

    public DateTime? CreatedAt { get; set; }

    public string Message { get; set; } = null!;

    public string? SecureToken { get; set; }

    public int ApplicationId { get; set; }

    public virtual Application Application { get; set; } = null!;
}
