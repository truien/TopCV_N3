using System;
using System.Collections.Generic;

namespace BACKEND.Models;

public partial class Notification
{
    public int Id { get; set; }

    public int RecipientId { get; set; }

    public string RecipientType { get; set; } = null!;

    public int? SenderId { get; set; }

    public string? SenderType { get; set; }

    public string Type { get; set; } = null!;

    public string Title { get; set; } = null!;

    public string Message { get; set; } = null!;

    public string? Data { get; set; }

    public bool? IsRead { get; set; }

    public DateTime? ReadAt { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual User Recipient { get; set; } = null!;

    public virtual User? Sender { get; set; }
}
