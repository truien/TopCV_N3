using System.ComponentModel.DataAnnotations;

public class UpdateReportStatusDto
{
    [Required]
    [StringLength(20)]
    public string Status { get; set; } = string.Empty;
}
