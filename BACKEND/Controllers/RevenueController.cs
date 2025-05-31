using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BACKEND.Models;

namespace BACKEND.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RevenueController : ControllerBase
    {
        private readonly TopcvBeContext _context;

        public class RevenueSummaryDto
        {
            public decimal DailyRevenue { get; set; }
            public decimal MonthlyRevenue { get; set; }
            public decimal YearlyRevenue { get; set; }
            public decimal TotalRevenue { get; set; }
        }

        public class RevenueChartDataDto
        {
            public required string[] Labels { get; init; }
            public required decimal[] Values { get; init; }
        }

        public class OrderDetailDto
        {
            public int Id { get; set; }
            public int PackageId { get; set; }
            public required string? OrderCode { get; set; }
            public DateTime CreatedAt { get; set; }
            public required string? CustomerName { get; set; }
            public required string? PackageName { get; set; }
            public decimal Amount { get; set; }
            public required string? Status { get; set; }
        }

        public RevenueController(TopcvBeContext context)
        {
            _context = context;
        }
        [Authorize(Roles = "admin")]
        [HttpGet("summary")]
        public async Task<ActionResult<RevenueSummaryDto>> GetRevenueSummary()
        {
            var today = DateTime.Today;
            var firstDayOfMonth = new DateTime(today.Year, today.Month, 1);
            var firstDayOfYear = new DateTime(today.Year, 1, 1);

            var summary = new RevenueSummaryDto
            {
                DailyRevenue = await _context.Orders
                    .Where(o => o.CreatedAt.HasValue && o.CreatedAt.Value.Date == today)
                    .SumAsync(o => o.Amount),

                MonthlyRevenue = await _context.Orders
                    .Where(o => o.CreatedAt.HasValue && o.CreatedAt.Value >= firstDayOfMonth)
                    .SumAsync(o => o.Amount),

                YearlyRevenue = await _context.Orders
                    .Where(o => o.CreatedAt.HasValue && o.CreatedAt.Value >= firstDayOfYear)
                    .SumAsync(o => o.Amount),

                TotalRevenue = await _context.Orders
                    .SumAsync(o => o.Amount)
            };

            return Ok(summary);
        }
        [Authorize(Roles = "admin")]
        [HttpGet("chart-data")]
        public async Task<ActionResult<RevenueChartDataDto>> GetRevenueChartData([FromQuery] string period = "monthly")
        {
            var today = DateTime.Today;

            if (period.Equals("daily", StringComparison.OrdinalIgnoreCase))
            {
                var last30Days = Enumerable.Range(0, 30)
                    .Select(i => today.AddDays(-i))
                    .Reverse()
                    .ToList();

                var dailyData = new List<decimal>();

                foreach (var date in last30Days)
                {
                    var sum = await _context.Orders
                        .Where(o => o.CreatedAt.HasValue && o.CreatedAt.Value.Date == date
                        && o.Status == "paid")
                        .SumAsync(o => o.Amount);

                    dailyData.Add(sum);
                }

                return Ok(new RevenueChartDataDto
                {
                    Labels = last30Days.Select(d => d.ToString("dd/MM")).ToArray(),
                    Values = dailyData.ToArray()
                });
            }

            if (period.Equals("monthly", StringComparison.OrdinalIgnoreCase))
            {
                var last12Months = Enumerable.Range(0, 12)
                    .Select(i => today.AddMonths(-i))
                    .Reverse()
                    .ToList();

                var monthlyData = new List<decimal>();

                foreach (var date in last12Months)
                {
                    var sum = await _context.Orders
                        .Where(o => o.CreatedAt.HasValue &&
                                    o.CreatedAt.Value.Year == date.Year &&
                                    o.CreatedAt.Value.Month == date.Month
                                    && o.Status == "paid")
                        .SumAsync(o => o.Amount);

                    monthlyData.Add(sum);
                }

                return Ok(new RevenueChartDataDto
                {
                    Labels = last12Months.Select(d => d.ToString("MM/yyyy")).ToArray(),
                    Values = monthlyData.ToArray()
                });
            }

            if (period.Equals("yearly", StringComparison.OrdinalIgnoreCase))
            {
                var last5Years = Enumerable.Range(0, 5)
                    .Select(i => today.AddYears(-i))
                    .Reverse()
                    .ToList();

                var yearlyData = new List<decimal>();

                foreach (var date in last5Years)
                {
                    var sum = await _context.Orders
                        .Where(o => o.CreatedAt.HasValue && o.CreatedAt.Value.Year == date.Year
                                    && o.Status == "paid")
                        .SumAsync(o => o.Amount);

                    yearlyData.Add(sum);
                }

                return Ok(new RevenueChartDataDto
                {
                    Labels = last5Years.Select(d => d.Year.ToString()).ToArray(),
                    Values = yearlyData.ToArray()
                });
            }

            return BadRequest("Invalid period specified. Use 'daily', 'monthly', or 'yearly'.");
        }

        [Authorize(Roles = "admin")]
        [HttpGet("details")]
        public async Task<ActionResult<List<OrderDetailDto>>> GetRevenueDetails(
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate)
        {
            var query = _context.Orders
                .Include(o => o.User)
                .Include(o => o.Package)
                .Include(o => o.Orderdetails)
                    .ThenInclude(od => od.Package)
                .AsQueryable();

            if (startDate.HasValue)
            {
                query = query.Where(o => o.CreatedAt.HasValue && o.CreatedAt.Value.Date >= startDate.Value.Date);
            }

            if (endDate.HasValue)
            {
                query = query.Where(o => o.CreatedAt.HasValue && o.CreatedAt.Value.Date <= endDate.Value.Date);
            }

#pragma warning disable CS8602 // Dereference of a possibly null reference.
            var orders = await query
                .OrderByDescending(o => o.CreatedAt)
                .Select(o => new OrderDetailDto
                {
                    Id = o.Id,
                    PackageId = o.PackageId ?? 0,
                    OrderCode = o.TransactionId.HasValue ? o.TransactionId.Value.ToString() : "N/A",
                    CreatedAt = o.CreatedAt ?? DateTime.MinValue,
                    CustomerName = o.User.Username,
                    PackageName = o.PackageId != null
                        ? (o.PackageId != null ? o.Package.Name : "N/A")
                        : (o.Orderdetails.FirstOrDefault() != null && o.Orderdetails.First().Package != null
                            ? o.Orderdetails.First().Package.Name
                            : "N/A"),
                    Amount = o.Amount,
                    Status = o.Status ?? "N/A"
                })
                .ToListAsync();
#pragma warning restore CS8602 // Dereference of a possibly null reference.

            return Ok(orders);
        }

    }
}