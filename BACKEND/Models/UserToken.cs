using System;
using System.Collections.Generic;

namespace BACKEND.Models;

public partial class UserToken
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public string RefreshToken { get; set; } = null!;

    public DateTime ExpiresAt { get; set; }

    public virtual User User { get; set; } = null!;
}
