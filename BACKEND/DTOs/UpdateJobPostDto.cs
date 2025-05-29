namespace BACKEND.DTOs;

public class UpdateJobPostDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Requirements { get; set; } = string.Empty;
    public string Interest { get; set; } = string.Empty;
    public string? SalaryRange { get; set; }
    public string? Location { get; set; }
    public DateTime? ApplyDeadline { get; set; }
    public int? JobOpeningCount { get; set; }
    public List<int>? EmploymentTypeIds { get; set; }
    public List<int>? JobFieldIds { get; set; }
}
