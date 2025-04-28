using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BACKEND.Models;
using Microsoft.AspNetCore.Authorization;
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
        public async Task<IActionResult> GetProPackages()
        {
            var packages = await _context.ProPackages
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

    }

}