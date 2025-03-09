using System;
using System.Collections.Generic;

namespace BACKEND.Models;

public partial class OauthAccount
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public string Provider { get; set; } = null!;

    public string ProviderId { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
