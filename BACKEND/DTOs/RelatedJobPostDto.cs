public class RelatedJobPostDto
{
    public int Id { get; set; }
    public string? Title { get; set; }
    public string? CompanyName { get; set; }
    public string? Avatar { get; set; }
    public string? Location { get; set; }
    public DateTime? ApplyDeadline { get; set; }
    public DateTime? PostDate { get; set; }
    public string? SalaryRange { get; set; }
    public int RelevanceScore { get; set; }
}