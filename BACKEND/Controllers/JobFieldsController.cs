using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BACKEND.Models;
using Microsoft.AspNetCore.Authorization;


[Route("api/[controller]")]
[ApiController]
public class JobFieldsController : ControllerBase
{
    private readonly TopcvBeContext _context;

    public JobFieldsController(TopcvBeContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var fields = await _context.JobFields
            .Select(f => new { f.Id, f.Name })
            .ToListAsync();

        return Ok(fields);
    }
}