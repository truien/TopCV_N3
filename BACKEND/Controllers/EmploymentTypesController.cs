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

    // Admin endpoints for CRUD operations
    [HttpGet("admin")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> GetAllForAdmin()
    {
        var types = await _context.EmploymentTypes
            .Select(t => new
            {
                t.Id,
                t.Name,
                JobPostCount = t.JobPostEmploymentTypes.Count
            })
            .OrderBy(t => t.Name)
            .ToListAsync();

        return Ok(types);
    }

    [HttpGet("admin/{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> GetById(int id)
    {
        var type = await _context.EmploymentTypes
            .Where(t => t.Id == id)
            .Select(t => new { t.Id, t.Name })
            .FirstOrDefaultAsync();

        if (type == null)
            return NotFound(new { message = "Hình thức làm việc không tồn tại" });

        return Ok(type);
    }

    [HttpPost("admin")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Create([FromBody] CreateEmploymentTypeDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest(new { message = "Tên hình thức làm việc không được để trống" });

        // Check if name already exists
        var existingType = await _context.EmploymentTypes
            .FirstOrDefaultAsync(t => t.Name.ToLower() == dto.Name.ToLower());

        if (existingType != null)
            return BadRequest(new { message = "Tên hình thức làm việc đã tồn tại" });

        var employmentType = new EmploymentType
        {
            Name = dto.Name.Trim()
        };

        _context.EmploymentTypes.Add(employmentType);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            id = employmentType.Id,
            name = employmentType.Name,
            message = "Tạo hình thức làm việc thành công"
        });
    }

    [HttpPut("admin/{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateEmploymentTypeDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest(new { message = "Tên hình thức làm việc không được để trống" });

        var employmentType = await _context.EmploymentTypes.FindAsync(id);
        if (employmentType == null)
            return NotFound(new { message = "Hình thức làm việc không tồn tại" });

        // Check if name already exists (excluding current record)
        var existingType = await _context.EmploymentTypes
            .FirstOrDefaultAsync(t => t.Name.ToLower() == dto.Name.ToLower() && t.Id != id);

        if (existingType != null)
            return BadRequest(new { message = "Tên hình thức làm việc đã tồn tại" });

        employmentType.Name = dto.Name.Trim();
        await _context.SaveChangesAsync();

        return Ok(new
        {
            id = employmentType.Id,
            name = employmentType.Name,
            message = "Cập nhật hình thức làm việc thành công"
        });
    }

    [HttpDelete("admin/{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var employmentType = await _context.EmploymentTypes
            .Include(t => t.JobPostEmploymentTypes)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (employmentType == null)
            return NotFound(new { message = "Hình thức làm việc không tồn tại" });

        // Check if employment type is being used
        if (employmentType.JobPostEmploymentTypes.Any())
            return BadRequest(new { message = "Không thể xóa hình thức làm việc đang được sử dụng" });

        _context.EmploymentTypes.Remove(employmentType);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Xóa hình thức làm việc thành công" });
    }
}

// DTOs for EmploymentType management
public class CreateEmploymentTypeDto
{
    public string Name { get; set; } = string.Empty;
}

public class UpdateEmploymentTypeDto
{
    public string Name { get; set; } = string.Empty;
}
