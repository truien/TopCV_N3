public class CreateJobPostDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Requirements { get; set; } = string.Empty;
    public string Interest { get; set; } = string.Empty;
    public string SalaryRange { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public DateTime ApplyDeadline { get; set; }
    public int JobOpeningCount { get; set; } = 1;

    public List<int> EmploymentTypeIds { get; set; } = new();
    public List<int> JobFieldIds { get; set; } = new();
}
