using System;
using System.Collections.Generic;

namespace BACKEND.Models;

public partial class Order
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public decimal Amount { get; set; }

    public DateTime? CreatedAt { get; set; }

    public string? Status { get; set; }

    public string? PaymentGateway { get; set; }

    public long? TransactionId { get; set; }

    public virtual ICollection<Orderdetail> Orderdetails { get; set; } = new List<Orderdetail>();

    public virtual User User { get; set; } = null!;
}
