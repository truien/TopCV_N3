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
    [Authorize(Roles = "admin")]
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

        [HttpGet("chart-data")]
        public async Task<ActionResult<RevenueChartDataDto>> GetRevenueChartData([FromQuery] string period = "monthly")
        {
            var today = DateTime.Today;

            switch (period.ToLower())
            {
                case "daily":
                    var last30Days = Enumerable.Range(0, 30)
                        .Select(i => today.AddDays(-i))
                        .Reverse()
                        .ToList();

                    var dailyData = await Task.WhenAll(last30Days.Select(async date =>
                        await _context.Orders
                            .Where(o => o.CreatedAt.HasValue && o.CreatedAt.Value.Date == date)
                            .SumAsync(o => o.Amount)));

                    return Ok(new RevenueChartDataDto
                    {
                        Labels = last30Days.Select(d => d.ToString("dd/MM")).ToArray(),
                        Values = dailyData
                    });

                case "monthly":
                    var last12Months = Enumerable.Range(0, 12)
                        .Select(i => today.AddMonths(-i))
                        .Reverse()
                        .ToList();

                    var monthlyData = await Task.WhenAll(last12Months.Select(async date =>
                        await _context.Orders
                            .Where(o => o.CreatedAt.HasValue &&
                                   o.CreatedAt.Value.Year == date.Year &&
                                   o.CreatedAt.Value.Month == date.Month)
                            .SumAsync(o => o.Amount)));

                    return Ok(new RevenueChartDataDto
                    {
                        Labels = last12Months.Select(d => d.ToString("MM/yyyy")).ToArray(),
                        Values = monthlyData
                    });

                case "yearly":
                    var last5Years = Enumerable.Range(0, 5)
                        .Select(i => today.AddYears(-i))
                        .Reverse()
                        .ToList();

                    var yearlyData = await Task.WhenAll(last5Years.Select(async date =>
                        await _context.Orders
                            .Where(o => o.CreatedAt.HasValue && o.CreatedAt.Value.Year == date.Year)
                            .SumAsync(o => o.Amount)));

                    return Ok(new RevenueChartDataDto
                    {
                        Labels = last5Years.Select(d => d.Year.ToString()).ToArray(),
                        Values = yearlyData
                    });

                default:
                    return BadRequest("Invalid period specified. Use 'daily', 'monthly', or 'yearly'.");
            }
        }

        [HttpGet("details")]
        public async Task<ActionResult<List<OrderDetailDto>>> GetRevenueDetails(
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate)
        {
            var query = _context.Orders
                .Include(o => o.User)
                .Include(o => o.Package)
                .AsQueryable();

            if (startDate.HasValue)
            {
                query = query.Where(o => o.CreatedAt.HasValue && o.CreatedAt.Value.Date >= startDate.Value.Date);
            }

            if (endDate.HasValue)
            {
                query = query.Where(o => o.CreatedAt.HasValue && o.CreatedAt.Value.Date <= endDate.Value.Date);
            }

            var orders = await query
                .OrderByDescending(o => o.CreatedAt)
                .Select(o => new OrderDetailDto
                {
                    Id = o.Id,
                    PackageId = o.PackageId ?? 0,
                    OrderCode = o.TransactionId.HasValue ? o.TransactionId.Value.ToString() : "N/A",
                    CreatedAt = o.CreatedAt ?? DateTime.MinValue,
                    CustomerName = o.User.Username,
                    PackageName = o.Package != null ? o.Package.Name : "N/A",
                    Amount = o.Amount,
                    Status = o.Status ?? "N/A"
                })
                .ToListAsync();

            return Ok(orders);
        }
    }
}