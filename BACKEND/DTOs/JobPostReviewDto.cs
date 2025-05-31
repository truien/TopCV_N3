namespace BACKEND.DTOs
{
    public class CreateJobPostReviewDto
    {
        public int JobPostId { get; set; }
        public sbyte Rating { get; set; } // Từ 1-5 sao
        public string? Comment { get; set; }
    }

    public class JobPostReviewResponseDto
    {
        public int Id { get; set; }
        public int JobPostId { get; set; }
        public int UserId { get; set; }
        public sbyte Rating { get; set; }
        public string? Comment { get; set; }
        public DateTime? CreatedAt { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string? UserAvatar { get; set; }
    }

    public class JobPostReviewsStatsDto
    {
        public double AverageRating { get; set; }
        public int TotalReviews { get; set; }
        public Dictionary<int, int> RatingCounts { get; set; } = new Dictionary<int, int>();
    }
}
