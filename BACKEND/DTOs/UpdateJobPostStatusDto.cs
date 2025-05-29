namespace BACKEND.DTOs;

public class UpdateJobPostStatusDto
{
    public string Status { get; set; } = string.Empty;
    public string? Reason { get; set; }
}
