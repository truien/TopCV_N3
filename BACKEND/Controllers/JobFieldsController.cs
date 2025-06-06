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

    // Admin endpoints for CRUD operations
    [HttpGet("admin")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> GetAllForAdmin()
    {
        var fields = await _context.JobFields
            .Select(f => new
            {
                f.Id,
                f.Name,
                JobPostCount = f.JobPostFields.Count
            })
            .OrderBy(f => f.Name)
            .ToListAsync();

        return Ok(fields);
    }

    [HttpGet("admin/{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> GetById(int id)
    {
        var field = await _context.JobFields
            .Where(f => f.Id == id)
            .Select(f => new { f.Id, f.Name })
            .FirstOrDefaultAsync();

        if (field == null)
            return NotFound(new { message = "Lĩnh vực không tồn tại" });

        return Ok(field);
    }

    [HttpPost("admin")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Create([FromBody] CreateJobFieldDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest(new { message = "Tên lĩnh vực không được để trống" });

        // Check if name already exists
        var existingField = await _context.JobFields
            .FirstOrDefaultAsync(f => f.Name.ToLower() == dto.Name.ToLower());

        if (existingField != null)
            return BadRequest(new { message = "Tên lĩnh vực đã tồn tại" });

        var jobField = new JobField
        {
            Name = dto.Name.Trim()
        };

        _context.JobFields.Add(jobField);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            id = jobField.Id,
            name = jobField.Name,
            message = "Tạo lĩnh vực thành công"
        });
    }

    [HttpPut("admin/{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateJobFieldDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest(new { message = "Tên lĩnh vực không được để trống" });

        var jobField = await _context.JobFields.FindAsync(id);
        if (jobField == null)
            return NotFound(new { message = "Lĩnh vực không tồn tại" });

        // Check if name already exists (excluding current record)
        var existingField = await _context.JobFields
            .FirstOrDefaultAsync(f => f.Name.ToLower() == dto.Name.ToLower() && f.Id != id);

        if (existingField != null)
            return BadRequest(new { message = "Tên lĩnh vực đã tồn tại" });

        jobField.Name = dto.Name.Trim();
        await _context.SaveChangesAsync();

        return Ok(new
        {
            id = jobField.Id,
            name = jobField.Name,
            message = "Cập nhật lĩnh vực thành công"
        });
    }

    [HttpDelete("admin/{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var jobField = await _context.JobFields
            .Include(f => f.JobPostFields)
            .FirstOrDefaultAsync(f => f.Id == id);

        if (jobField == null)
            return NotFound(new { message = "Lĩnh vực không tồn tại" });

        // Check if job field is being used
        if (jobField.JobPostFields.Any())
            return BadRequest(new { message = "Không thể xóa lĩnh vực đang được sử dụng" });

        _context.JobFields.Remove(jobField);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Xóa lĩnh vực thành công" });
    }
}

// DTOs for JobField management
public class CreateJobFieldDto
{
    public string Name { get; set; } = string.Empty;
}

public class UpdateJobFieldDto
{
    public string Name { get; set; } = string.Empty;
}