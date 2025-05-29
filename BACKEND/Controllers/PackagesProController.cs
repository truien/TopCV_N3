using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BACKEND.Models;
using Microsoft.AspNetCore.Authorization;
using System.Text;
using ExcelDataReader;
using System.Data;

namespace BACKEND.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PackagesProController : ControllerBase
    {
        private readonly TopcvBeContext _context;
        public PackagesProController(TopcvBeContext context)
        {
            _context = context;
        }

        [AllowAnonymous]
        [HttpGet("pro-packages")]
        public async Task<IActionResult> GetProPackages([FromQuery] string? search)
        {
            var query = _context.ProPackages.AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(p => p.Name!.Contains(search) || (p.Description != null && p.Description.Contains(search)));
            }

            var packages = await query
                .Select(p => new
                {
                    p.Id,
                    p.Name,
                    p.Price,
                    p.DurationDays,
                    p.Description
                })
                .ToListAsync();

            return Ok(packages);
        }

        [Authorize(Roles = "admin")]
        [HttpPost("create")]
        public async Task<IActionResult> CreateProPackage([FromBody] ProPackage package)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            _context.ProPackages.Add(package);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetProPackages), new { id = package.Id }, package);
        }

        [Authorize(Roles = "admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProPackage(int id, [FromBody] ProPackage package)
        {
            if (id != package.Id)
                return BadRequest();

            var existingPackage = await _context.ProPackages.FindAsync(id);
            if (existingPackage == null)
                return NotFound();

            existingPackage.Name = package.Name;
            existingPackage.Price = package.Price;
            existingPackage.DurationDays = package.DurationDays;
            existingPackage.Description = package.Description;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ProPackageExists(id))
                    return NotFound();
                throw;
            }

            return NoContent();
        }

        [Authorize(Roles = "admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProPackage(int id)
        {
            var package = await _context.ProPackages.FindAsync(id);
            if (package == null)
                return NotFound();

            _context.ProPackages.Remove(package);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [Authorize(Roles = "admin")]
        [HttpGet("statistics")]
        public async Task<IActionResult> GetProPackageStatistics()
        {
            var statistics = await _context.ProSubscriptions
                .Include(s => s.Package)
                .GroupBy(s => s.PackageId)
                .Select(g => new
                {
                    PackageId = g.Key,
                    PackageName = g.FirstOrDefault()!.Package!.Name,
                    TotalSubscriptions = g.Count(),
                    TotalRevenue = g.Sum(s => s.Package!.Price),
                    ActiveSubscriptions = g.Count(s => s.EndDate > DateTime.UtcNow)
                })
                .ToListAsync();

            return Ok(statistics);
        }

        [Authorize(Roles = "admin")]
        [HttpPost("import")]
        public async Task<IActionResult> ImportProPackages(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("File không hợp lệ");

            var fileExtension = Path.GetExtension(file.FileName).ToLower();
            if (fileExtension != ".xlsx" && fileExtension != ".xls" && fileExtension != ".csv")
                return BadRequest("Định dạng file không được hỗ trợ");

            try
            {
                var packages = new List<ProPackage>();

                if (fileExtension == ".csv")
                {
                    using var reader = new StreamReader(file.OpenReadStream());
                    var headerLine = await reader.ReadLineAsync();

                    while (!reader.EndOfStream)
                    {
                        var line = await reader.ReadLineAsync();
                        if (string.IsNullOrEmpty(line)) continue;

                        var values = line.Split(',');
                        if (values.Length < 3) continue;

                        packages.Add(new ProPackage
                        {
                            Name = values[0].Trim('"'),
                            Description = values[1].Trim('"'),
                            Price = decimal.Parse(values[2]),
                            DurationDays = int.Parse(values[3]),
                            CreatedAt = DateTime.UtcNow
                        });
                    }
                }
                else // Excel file
                {
                    System.Text.Encoding.RegisterProvider(CodePagesEncodingProvider.Instance);
                    using var stream = file.OpenReadStream();
                    using var reader = ExcelReaderFactory.CreateReader(stream);

                    reader.Read(); // Skip header row

                    while (reader.Read())
                    {
                        if (reader.GetValue(0) == null) continue;

#pragma warning disable CS8604 
                        packages.Add(new ProPackage
                        {
                            Name = reader.GetString(0),
                            Description = reader.GetValue(1)?.ToString(),
                            Price = decimal.Parse(reader.GetValue(2).ToString()),
                            DurationDays = int.Parse(reader.GetValue(3).ToString()),
                            CreatedAt = DateTime.UtcNow
                        });
#pragma warning restore CS8604 
                    }
                }

                await _context.ProPackages.AddRangeAsync(packages);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Import thành công", count = packages.Count });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi import dữ liệu", error = ex.Message });
            }
        }

        private bool ProPackageExists(int id)
        {
            return _context.ProPackages.Any(e => e.Id == id);
        }
    }
}