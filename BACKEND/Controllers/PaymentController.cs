using Microsoft.AspNetCore.Mvc;
using BACKEND.Models;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using VNPAY.NET;
using VNPAY.NET.Models;
using VNPAY.NET.Enums;
using Microsoft.EntityFrameworkCore;


[Authorize(Roles = "employer")]
[ApiController]
[Route("api/[controller]")]
public class PaymentController : ControllerBase
{
    private readonly TopcvBeContext _context;
    private readonly IVnpay _vnpay;
    private readonly IConfiguration _configuration;
    public PaymentController(TopcvBeContext context, IVnpay vnpay, IConfiguration configuration)
    {
        _context = context;
        _vnpay = vnpay;
        _configuration = configuration;
        var tmnCode = _configuration["Vnpay:TmnCode"] ?? throw new Exception("Thiếu Vnpay:TmnCode trong config!");
        var hashSecret = _configuration["Vnpay:HashSecret"] ?? throw new Exception("Thiếu Vnpay:HashSecret trong config!");
        var baseUrl = _configuration["Vnpay:BaseUrl"] ?? throw new Exception("Thiếu Vnpay:BaseUrl trong config!");
        var returnUrl = _configuration["Vnpay:ReturnUrl"] ?? throw new Exception("Thiếu Vnpay:ReturnUrl trong config!");

        _vnpay.Initialize(tmnCode, hashSecret, baseUrl, returnUrl);

    }

    [HttpPost("vnpay-create")]
    public async Task<IActionResult> CreateVNPayOrder([FromBody] CreateOrderDto dto)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();
        int userId = int.Parse(userIdStr);

        var jobPost = await _context.JobPosts.FindAsync(dto.JobPostId);
        if (jobPost == null || jobPost.EmployerId != userId)
            return BadRequest(new { message = "Bài viết không hợp lệ." });

        var package = await _context.Packages.FindAsync(dto.PackageId);
        if (package == null)
            return BadRequest(new { message = "Gói dịch vụ không tồn tại." });

        var order = new Order
        {
            UserId = userId,
            Amount = (int)package.Price,
            CreatedAt = DateTime.UtcNow,
            PaymentGateway = "vnpay",
            Status = "pending",
            TransactionId = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
        };
        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        var orderDetail = new Orderdetail
        {
            OrderId = order.Id,
            PackageId = package.Id,
            JobPostId = jobPost.Id,
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddDays(package.DurationDays)
        };
        _context.Orderdetails.Add(orderDetail);
        await _context.SaveChangesAsync();

        var ipAddress = NetworkHelper.GetIpAddress(HttpContext);

        var paymentRequest = new PaymentRequest
        {
            PaymentId = (long)order.TransactionId,
            Money = (int)package.Price,
            Description = $"Thanh toán gói {package.Name} cho bài viết {jobPost.Title}",
            IpAddress = ipAddress,
            CreatedDate = DateTime.Now,
            Currency = Currency.VND,
            Language = DisplayLanguage.Vietnamese,
            BankCode = BankCode.ANY
        };

        var paymentUrl = _vnpay.GetPaymentUrl(paymentRequest);

        return Ok(new { paymentUrl });
    }


    [AllowAnonymous]
    [HttpGet("callback")]
    public async Task<IActionResult> Callback()
    {
        if (!Request.QueryString.HasValue)
            return NotFound("Không tìm thấy dữ liệu thanh toán.");

        var result = _vnpay.GetPaymentResult(Request.Query);

        if (!result.IsSuccess)
            return Redirect("http://localhost:5173/thanh-toan/that-bai");

        var transactionId = result.PaymentId;

        var order = await _context.Orders
            .Include(x => x.Orderdetails)
            .FirstOrDefaultAsync(x => x.TransactionId == transactionId);

        if (order == null)
            return NotFound("Không tìm thấy đơn hàng.");

        if (order.Status == "paid")
            return Redirect("http://localhost:5173/thanh-toan/thanh-cong");

        order.Status = "paid";

        foreach (var detail in order.Orderdetails)
        {
            var existingPromotion = await _context.JobPostPromotions
                .FirstOrDefaultAsync(x => x.JobPostId == detail.JobPostId && x.PackageId == detail.PackageId);

            if (existingPromotion != null)
            {
                existingPromotion.EndDate = existingPromotion.EndDate.AddDays((detail.EndDate - detail.StartDate).Days);
            }
            else
            {
                _context.JobPostPromotions.Add(new JobPostPromotion
                {
                    JobPostId = detail.JobPostId,
                    PackageId = detail.PackageId,
                    StartDate = DateTime.UtcNow,
                    EndDate = DateTime.UtcNow.AddDays((detail.EndDate - detail.StartDate).Days)
                });
            }
        }

        await _context.SaveChangesAsync();

        return Redirect("http://localhost:5173/thanh-toan/thanh-cong");
    }

    [AllowAnonymous]
    [HttpGet("ipn")]
    public async Task<IActionResult> Ipn()
    {
        if (!Request.QueryString.HasValue)
            return NotFound("Không tìm thấy dữ liệu IPN.");

        var result = _vnpay.GetPaymentResult(Request.Query);

        if (!result.IsSuccess)
            return Ok("Giao dịch thất bại.");

        var transactionId = result.PaymentId;


        var order = await _context.Orders
            .Include(x => x.Orderdetails)
            .FirstOrDefaultAsync(x => x.TransactionId == transactionId);

        if (order == null)
            return NotFound("Không tìm thấy đơn hàng.");

        if (order.Status == "paid")
            return Ok("Đơn hàng đã thanh toán.");

        order.Status = "paid";

        foreach (var detail in order.Orderdetails)
        {
            var existingPromotion = await _context.JobPostPromotions
                .FirstOrDefaultAsync(x => x.JobPostId == detail.JobPostId && x.PackageId == detail.PackageId);

            if (existingPromotion != null)
            {
                existingPromotion.EndDate = existingPromotion.EndDate.AddDays((detail.EndDate - detail.StartDate).Days);
            }
            else
            {
                _context.JobPostPromotions.Add(new JobPostPromotion
                {
                    JobPostId = detail.JobPostId,
                    PackageId = detail.PackageId,
                    StartDate = DateTime.UtcNow,
                    EndDate = DateTime.UtcNow.AddDays((detail.EndDate - detail.StartDate).Days)
                });
            }
        }

        await _context.SaveChangesAsync();

        return Ok("Thanh toán thành công.");
    }
    public class MomoCreateRequest
    {
        public int JobPostId { get; set; }
        public int PackageId { get; set; }
    }

    public class CreateOrderDto
    {
        public int PackageId { get; set; }
        public int JobPostId { get; set; }
    }

    public class CreatePaymentRequest
    {
        public double Amount { get; set; }
        public string Description { get; set; } = string.Empty;
    }
}

