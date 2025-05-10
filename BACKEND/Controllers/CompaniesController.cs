using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BACKEND.Models;

namespace BACKEND.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CompaniesController : ControllerBase
    {
        private readonly TopcvBeContext _context;
        public CompaniesController(TopcvBeContext context)
        {
            _context = context;
        }
        [HttpGet("{slug}")]
        public async Task<IActionResult> GetBySlug(string slug)
        {
            var company = await _context.CompanyProfiles
                .Where(c => c.Slug == slug)
                .Select(c => new
                {
                    c.UserId,
                    c.CompanyName,
                    c.Description,
                    c.Location,
                    c.Website,
                    Avatar = c.User.Avatar != null 
                        ? (c.User.Avatar.StartsWith("http") ? c.User.Avatar : $"{Request.Scheme}://{Request.Host}/avatar/{c.User.Avatar}") 
                        : null
                })
                .FirstOrDefaultAsync();

            if (company == null)
                return NotFound(new { message = "Không tìm thấy công ty." });

            return Ok(company);
        }
    }
}
