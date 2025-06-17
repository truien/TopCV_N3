using Microsoft.AspNetCore.Mvc;
using BACKEND.Models;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using System.Net;
using PayPalCheckoutSdk.Core;
using PayPalCheckoutSdk.Orders;
using System.Text.Json;
using System.Globalization;

[Authorize(Roles = "employer")]
[ApiController]
[Route("api/[controller]")]
public class PaymentController : ControllerBase
{
    private readonly TopcvBeContext _context;
    private readonly IConfiguration _configuration;
    private readonly PayPalClient _payPalClient;
    public PaymentController(TopcvBeContext context, IConfiguration configuration, PayPalClient payPalClient)
    {
        _context = context;
        _configuration = configuration;
        _payPalClient = payPalClient;
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
            return BadRequest(new { message = "Gói dịch vụ không tồn tại." }); var order = new BACKEND.Models.Order
            {
                UserId = userId,
                Amount = (int)package.Price,
                CreatedAt = DateTime.UtcNow,
                PaymentGateway = "paypal",
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

        // Tạo PayPal Order
        var paypalClient = _payPalClient.Client();

        var baseUrl = _configuration["BackEndApiUrl"] ?? "https://localhost:7026";
        var returnUrl = _configuration["PayPal:ReturnUrl"] ?? $"{baseUrl}/api/payment/callback";
        var cancelUrl = _configuration["PayPal:CancelUrl"] ?? "http://localhost:5173/thanh-toan/that-bai";
        var usdAmount = Math.Round(package.Price / 25000m, 2);
        var orderRequest = new OrderRequest()
        {
            CheckoutPaymentIntent = "CAPTURE",
            PurchaseUnits = new List<PurchaseUnitRequest>()
            {
                new PurchaseUnitRequest()
                {
                    ReferenceId = order.Id.ToString(),
                    Description = $"Thanh toán gói {package.Name} cho bài viết {jobPost.Title}",
                    CustomId = order.Id.ToString(),
                    AmountWithBreakdown = new AmountWithBreakdown()
                        {
                            CurrencyCode = "USD",
                            Value = usdAmount.ToString("F2", CultureInfo.InvariantCulture)
                        }
                }
            },
            ApplicationContext = new ApplicationContext()
            {
                ReturnUrl = returnUrl,
                CancelUrl = cancelUrl
            }
        };

        var request = new OrdersCreateRequest();
        request.Headers.Add("prefer", "return=representation");
        request.RequestBody(orderRequest);

        try
        {
            var response = await paypalClient.Execute(request);
            var statusCode = response.StatusCode;
            var result = response.Result<PayPalCheckoutSdk.Orders.Order>();

            // Lưu PayPal Order ID vào database
            order.PaymentOrderId = result.Id;
            await _context.SaveChangesAsync();

            // Tìm Link URL thanh toán trong các link được trả về
            var paymentUrl = result.Links.First(x => x.Rel == "approve").Href;

            return Ok(new { paymentUrl });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = $"Lỗi khi tạo đơn hàng PayPal: {ex.Message}" });
        }
    }
    [AllowAnonymous]
    [HttpGet("callback")]
    public async Task<IActionResult> Callback([FromQuery] string? token = null, [FromQuery] string? PayerID = null)
    {
        // Nếu không có token, redirect về trang thất bại
        if (string.IsNullOrEmpty(token))
            return Redirect(_configuration["PayPal:CancelUrl"] ?? "http://localhost:5173/thanh-toan/that-bai");

        try
        {
            // Tìm order dựa trên PaymentOrderId
            var order = await _context.Orders
                .Include(x => x.Orderdetails)
                .FirstOrDefaultAsync(x => x.PaymentOrderId == token);

            if (order == null)
                return Redirect(_configuration["PayPal:CancelUrl"] ?? "http://localhost:5173/thanh-toan/that-bai");

            // Nếu đã thanh toán rồi, redirect về trang thành công
            if (order.Status == "paid")
                return Redirect(_configuration["FrontEndBaseUrl"] + "/thanh-toan/thanh-cong");

            // Capture payment từ PayPal
            var paypalClient = _payPalClient.Client();
            var request = new PayPalCheckoutSdk.Orders.OrdersCaptureRequest(token);
            request.RequestBody(new OrderActionRequest());

            var response = await paypalClient.Execute(request);

            // Nếu capture thành công
            if (response.StatusCode == HttpStatusCode.Created || response.StatusCode == HttpStatusCode.OK)
            {
                var result = response.Result<PayPalCheckoutSdk.Orders.Order>();

                // Cập nhật trạng thái đơn hàng
                order.Status = "paid";

                // Xử lý các chi tiết đơn hàng
                if (order.Orderdetails != null && order.Orderdetails.Any())
                {
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
                }
                // Xử lý đơn hàng gói Pro
                else if (order.PackageId.HasValue)
                {
                    var package = await _context.ProPackages.FindAsync(order.PackageId.Value);

                    if (package == null)
                        return NotFound("Không tìm thấy gói Pro để kích hoạt.");

                    var proSub = await _context.ProSubscriptions
                        .FirstOrDefaultAsync(p => p.UserId == order.UserId);

                    if (proSub != null)
                    {
                        if (proSub.EndDate > DateTime.UtcNow)
                        {
                            proSub.EndDate = proSub.EndDate.AddDays(package.DurationDays);
                        }
                        else
                        {
                            proSub.StartDate = DateTime.UtcNow;
                            proSub.EndDate = DateTime.UtcNow.AddDays(package.DurationDays);
                        }
                        proSub.PostsLeftThisPeriod = 20; // Reset số lượt bài
                    }
                    else
                    {
                        _context.ProSubscriptions.Add(new ProSubscription
                        {
                            UserId = order.UserId,
                            PackageId = package.Id,
                            StartDate = DateTime.UtcNow,
                            EndDate = DateTime.UtcNow.AddDays(package.DurationDays),
                            PostsLeftThisPeriod = 20
                        });
                    }
                }

                await _context.SaveChangesAsync();
                return Redirect(_configuration["FrontEndBaseUrl"] + "/thanh-toan/thanh-cong");
            }
            else
            {
                return Redirect(_configuration["PayPal:CancelUrl"] ?? "http://localhost:5173/thanh-toan/that-bai");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"PayPal callback error: {ex.Message}");
            return Redirect(_configuration["PayPal:CancelUrl"] ?? "http://localhost:5173/thanh-toan/that-bai");
        }
    }

    [AllowAnonymous]
    [HttpGet("paypal-callback")]
    public async Task<IActionResult> PayPalCallback([FromQuery] string token, [FromQuery] string PayerID)
    {
        return await Callback(token, PayerID);
    }

    [AllowAnonymous]
    [HttpGet("paypal-cancel")]
    public IActionResult PayPalCancel()
    {
        return Redirect("http://localhost:5173/thanh-toan/that-bai");
    }
    [AllowAnonymous]
    [HttpGet("ipn")]
    public IActionResult Ipn()
    {
        // Đây chỉ là một API giả để giữ tương thích với frontend
        // Với PayPal, chúng ta sử dụng webhook khác (có thể triển khai sau)
        return Ok("PayPal webhook received");
    }

    [HttpPost("pro-create")]
    public async Task<IActionResult> CreateProVNPayOrder([FromBody] BuyProRequest buyRequest)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdStr))
            return Unauthorized();
        int userId = int.Parse(userIdStr);

        var package = await _context.ProPackages.FindAsync(buyRequest.PackageId);
        if (package == null)
            return BadRequest(new { message = "Gói Pro không tồn tại." });

        var order = new BACKEND.Models.Order
        {
            UserId = userId,
            Amount = (int)package.Price,
            CreatedAt = DateTime.UtcNow,
            PaymentGateway = "paypal",
            Status = "pending",
            TransactionId = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
            PackageId = package.Id
        };

        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        // Tạo PayPal Order
        var paypalClient = _payPalClient.Client();

        var baseUrl = _configuration["BackEndApiUrl"] ?? "https://localhost:7026";
        var returnUrl = _configuration["PayPal:ReturnUrl"] ?? $"{baseUrl}/api/payment/callback";
        var cancelUrl = _configuration["PayPal:CancelUrl"] ?? "http://localhost:5173/thanh-toan/that-bai";

        var usdAmount = Math.Round(package.Price / 25000m, 2);
        var orderRequest = new OrderRequest()
        {
            CheckoutPaymentIntent = "CAPTURE",
            PurchaseUnits = new List<PurchaseUnitRequest>()
    {
        new PurchaseUnitRequest()
        {
            ReferenceId = order.Id.ToString(),
            Description = $"Thanh toán gói Pro {package.Name}",
            CustomId = order.Id.ToString(),
            AmountWithBreakdown = new AmountWithBreakdown()
            {
                CurrencyCode = "USD",
                Value = usdAmount.ToString("F2", CultureInfo.InvariantCulture)
            }
        }
    },
            ApplicationContext = new ApplicationContext()
            {
                ReturnUrl = returnUrl,
                CancelUrl = cancelUrl
            }
        };

        var createRequest = new OrdersCreateRequest();
        createRequest.Headers.Add("prefer", "return=representation");
        createRequest.RequestBody(orderRequest);

        try
        {
            var response = await paypalClient.Execute(createRequest);
            var result = response.Result<PayPalCheckoutSdk.Orders.Order>();

            // Lưu PayPal Order ID vào database
            order.PaymentOrderId = result.Id;
            await _context.SaveChangesAsync();

            // Tìm Link URL thanh toán trong các link được trả về
            var paymentUrl = result.Links.First(x => x.Rel == "approve").Href;

            return Ok(new { paymentUrl });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = $"Lỗi khi tạo đơn hàng PayPal: {ex.Message}" });
        }
    }

    private PayPalCheckoutSdk.Orders.OrderRequest BuildOrderRequest(decimal amount, string description, string customId)
    {
        var orderRequest = new PayPalCheckoutSdk.Orders.OrderRequest()
        {
            CheckoutPaymentIntent = "CAPTURE",
            PurchaseUnits = new List<PurchaseUnitRequest>()
            {
                new PurchaseUnitRequest()
                {
                    AmountWithBreakdown = new AmountWithBreakdown()
                    {
                        CurrencyCode = "USD",
                        Value = ConvertVNDToUSD(amount).ToString("F2")
                    },
                    Description = description,
                    CustomId = customId
                }
            },
            ApplicationContext = new ApplicationContext()
            {
                ReturnUrl = _configuration["PayPal:ReturnUrl"] ?? "http://localhost:5046/api/payment/callback",
                CancelUrl = _configuration["PayPal:CancelUrl"] ?? "http://localhost:5173/thanh-toan/that-bai",
                BrandName = "TopCV",
                LandingPage = "BILLING",
                UserAction = "PAY_NOW"
            }
        };

        return orderRequest;
    }

    private decimal ConvertVNDToUSD(decimal vndAmount)
    {
        // Tỷ giá tham khảo: 1 USD = 24,000 VND
        // Bạn có thể tích hợp API tỷ giá thực tế ở đây
        decimal exchangeRate = 24000m;
        return Math.Round(vndAmount / exchangeRate, 2);
    }

    private async Task ProcessOrderCompletion(BACKEND.Models.Order order)
    {
        if (order.Orderdetails != null && order.Orderdetails.Any())
        {
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
        }
        else if (order.PackageId.HasValue)
        {
            var package = await _context.ProPackages.FindAsync(order.PackageId.Value);

            if (package == null)
                return;

            var proSub = await _context.ProSubscriptions
                .FirstOrDefaultAsync(p => p.UserId == order.UserId);

            if (proSub != null)
            {
                if (proSub.EndDate > DateTime.UtcNow)
                {
                    proSub.EndDate = proSub.EndDate.AddDays(package.DurationDays);
                }
                else
                {
                    proSub.StartDate = DateTime.UtcNow;
                    proSub.EndDate = DateTime.UtcNow.AddDays(package.DurationDays);
                }
                proSub.PostsLeftThisPeriod = 20;
            }
            else
            {
                _context.ProSubscriptions.Add(new ProSubscription
                {
                    UserId = order.UserId,
                    PackageId = package.Id,
                    StartDate = DateTime.UtcNow,
                    EndDate = DateTime.UtcNow.AddDays(package.DurationDays),
                    PostsLeftThisPeriod = 20
                });
            }
        }
    }

    public class BuyProRequest
    {
        public int PackageId { get; set; }
    }

    public class CreateOrderDto
    {
        public int PackageId { get; set; }
        public int JobPostId { get; set; }
    }

}

