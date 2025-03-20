using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BACKEND.Models;
using Microsoft.AspNetCore.Authorization;

namespace BACKEND.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PackagesPostController : ControllerBase
    {
        private readonly TopcvBeContext _context;

        public PackagesPostController(TopcvBeContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Package>>> GetPackages()
        {
            return await _context.Packages.ToListAsync();
        }
        [Authorize(Roles = "admin")]
        [HttpGet("{id}")]
        public async Task<ActionResult<Package>> GetPackage(int id)
        {
            var package = await _context.Packages.FindAsync(id);

            if (package == null)
            {
                return NotFound();
            }

            return package;
        }
        [Authorize(Roles = "admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> PutPackage(int id, Package package)
        {
            if (id != package.Id)
            {
                return BadRequest();
            }

            _context.Entry(package).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PackageExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }
        [Authorize(Roles = "admin")]
        [HttpPost]
        public async Task<ActionResult<Package>> PostPackage(Package package)
        {
            _context.Packages.Add(package);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetPackage", new { id = package.Id }, package);
        }
        [Authorize(Roles = "admin")]
        [HttpDelete("{id}")]
        public async Task<ActionResult<Package>> DeletePackage(int id)
        {
            var package = await _context.Packages.FindAsync(id);
            if (package == null)
            {
                return NotFound();
            }

            _context.Packages.Remove(package);
            await _context.SaveChangesAsync();

            return package;
        }

        [Authorize(Roles = "admin")]
        [HttpGet("posts-using-packages")]
        public async Task<ActionResult<IEnumerable<object>>> GetPostsUsingPackages()
        {
            var result = await _context.JobPostPromotions
                .Include(jp => jp.JobPost)
                .Include(jp => jp.Package)
                .Where(jp => jp.EndDate > DateTime.Now)
                .Select(jp => new
                {
                    JobPostId = jp.JobPost.Id,
                    JobPostTitle = jp.JobPost.Title,
                    PackageId = jp.Package.Id,
                    PackageName = jp.Package.Name,
                    StartDate = jp.StartDate,
                    EndDate = jp.EndDate
                })
                .ToListAsync();

            return Ok(result);
        }

        [Authorize(Roles = "admin")]
        [HttpGet("company-post-packages")]
        public async Task<ActionResult<IEnumerable<object>>> GetCompanyPostPackages()
        {
            var result = await _context.JobPostPromotions
                .Include(jp => jp.JobPost)
                .ThenInclude(jp => jp.Employer)
                .ThenInclude(e => e.CompanyProfiles)
                .Include(jp => jp.Package)
                .Where(jp => jp.EndDate > DateTime.Now)
                .Select(jp => new
                {
                    CompanyId = jp.JobPost.Employer.Id,
                    CompanyName = jp.JobPost.Employer != null && jp.JobPost.Employer.CompanyProfiles.Count > 0
                    ? jp.JobPost.Employer.CompanyProfiles.First().CompanyName
                    : "Unknown",
                    JobPostId = jp.JobPost.Id,
                    JobPostTitle = jp.JobPost.Title,
                    PackageId = jp.Package.Id,
                    PackageName = jp.Package.Name,
                    StartDate = jp.StartDate,
                    EndDate = jp.EndDate
                })
                .ToListAsync();

            return Ok(result);
        }


        [Authorize(Roles = "admin")]
        [HttpGet("post-package-statistics")]
        public async Task<ActionResult<object>> GetPostPackageStatistics()
        {
            var totalSold = await _context.JobPostPromotions.CountAsync();
            var activeSubscriptions = await _context.JobPostPromotions.CountAsync(jp => jp.EndDate > DateTime.Now);

            var result = new
            {
                TotalSold = totalSold,
                ActiveSubscriptions = activeSubscriptions
            };

            return Ok(result);
        }

        private bool PackageExists(int id)
        {
            return _context.Packages.Any(e => e.Id == id);
        }
    }
    
    
}
