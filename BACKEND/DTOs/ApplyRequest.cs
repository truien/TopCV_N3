using System.ComponentModel.DataAnnotations;
public class ApplyRequest
{
    public int JobId { get; set; }

    [Required]
    public IFormFile? CvFile { get; set; }
}
