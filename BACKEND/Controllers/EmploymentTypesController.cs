using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BACKEND.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.VisualBasic;

[Route("api/[controller]")]
[ApiController]
public class EmploymentTypesController : ControllerBase
{
    private readonly TopcvBeContext _context;

    public EmploymentTypesController(TopcvBeContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var types = await _context.EmploymentTypes
            .Select(t => new { t.Id, t.Name })
            .ToListAsync();

        return Ok(types);
    }
}
