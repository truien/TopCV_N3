using System.ComponentModel.DataAnnotations;
public class ApplyRequest
{
    public int JobId { get; set; }

    public IFormFile? CvFile { get; set; }

    public string? CvFilePath { get; set; }
}
