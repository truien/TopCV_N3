using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Pomelo.EntityFrameworkCore.MySql.Scaffolding.Internal;

namespace BACKEND.Models;

public partial class TopcvBeContext : DbContext
{
    public TopcvBeContext()
    {
    }

    public TopcvBeContext(DbContextOptions<TopcvBeContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Application> Applications { get; set; }

    public virtual DbSet<CandidateProfile> CandidateProfiles { get; set; }

    public virtual DbSet<CompanyProfile> CompanyProfiles { get; set; }

    public virtual DbSet<EmploymentType> EmploymentTypes { get; set; }

    public virtual DbSet<Interview> Interviews { get; set; }

    public virtual DbSet<JobField> JobFields { get; set; }

    public virtual DbSet<JobPost> JobPosts { get; set; }

    public virtual DbSet<JobPostEmploymentType> JobPostEmploymentTypes { get; set; }

    public virtual DbSet<JobPostField> JobPostFields { get; set; }

    public virtual DbSet<JobPostPromotion> JobPostPromotions { get; set; }

    public virtual DbSet<JobPostReport> JobPostReports { get; set; }

    public virtual DbSet<JobPostReview> JobPostReviews { get; set; }

    public virtual DbSet<Package> Packages { get; set; }

    public virtual DbSet<ProPackage> ProPackages { get; set; }

    public virtual DbSet<ProSubscription> ProSubscriptions { get; set; }

    public virtual DbSet<SavedJob> SavedJobs { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<UserFollow> UserFollows { get; set; }

    public virtual DbSet<UserRole> UserRoles { get; set; }

    public virtual DbSet<Warning> Warnings { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        => optionsBuilder.UseMySql("server=localhost;database=topcv_be;user=root;password=admin", Microsoft.EntityFrameworkCore.ServerVersion.Parse("8.0.40-mysql"));

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder
            .UseCollation("utf8mb4_0900_ai_ci")
            .HasCharSet("utf8mb4");

        modelBuilder.Entity<Application>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("applications");

            entity.HasIndex(e => e.JobId, "job_id");

            entity.HasIndex(e => e.UserId, "user_id");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.AppliedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp")
                .HasColumnName("applied_at");
            entity.Property(e => e.CoverLetter)
                .HasColumnType("text")
                .HasColumnName("cover_letter");
            entity.Property(e => e.JobId).HasColumnName("job_id");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.Job).WithMany(p => p.Applications)
                .HasForeignKey(d => d.JobId)
                .HasConstraintName("applications_ibfk_2");

            entity.HasOne(d => d.User).WithMany(p => p.Applications)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("applications_ibfk_1");
        });

        modelBuilder.Entity<CandidateProfile>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("candidate_profiles");

            entity.HasIndex(e => e.UserId, "user_id");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Address)
                .HasColumnType("text")
                .HasColumnName("address");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp")
                .HasColumnName("created_at");
            entity.Property(e => e.CvFilePath)
                .HasMaxLength(255)
                .HasColumnName("cv_file_path");
            entity.Property(e => e.DateOfBirth).HasColumnName("date_of_birth");
            entity.Property(e => e.Fullname)
                .HasMaxLength(100)
                .HasColumnName("fullname");
            entity.Property(e => e.Phone)
                .HasMaxLength(15)
                .HasColumnName("phone");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.User).WithMany(p => p.CandidateProfiles)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("candidate_profiles_ibfk_1");
        });

        modelBuilder.Entity<CompanyProfile>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("company_profiles");

            entity.HasIndex(e => e.UserId, "user_id");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CompanyName)
                .HasMaxLength(255)
                .HasColumnName("company_name");
            entity.Property(e => e.Description)
                .HasColumnType("text")
                .HasColumnName("description");
            entity.Property(e => e.Location)
                .HasMaxLength(255)
                .HasColumnName("location");
            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.Website)
                .HasMaxLength(255)
                .HasColumnName("website");

            entity.HasOne(d => d.User).WithMany(p => p.CompanyProfiles)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("company_profiles_ibfk_1");
        });

        modelBuilder.Entity<EmploymentType>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("employment_types");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Name)
                .HasMaxLength(100)
                .HasColumnName("name");
        });

        modelBuilder.Entity<Interview>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("interviews");

            entity.HasIndex(e => e.ApplicantId, "applicant_id");

            entity.HasIndex(e => e.EmployerId, "employer_id");

            entity.HasIndex(e => e.JobId, "job_id");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.ApplicantId).HasColumnName("applicant_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp")
                .HasColumnName("created_at");
            entity.Property(e => e.EmployerId).HasColumnName("employer_id");
            entity.Property(e => e.JobId).HasColumnName("job_id");
            entity.Property(e => e.Message)
                .HasColumnType("text")
                .HasColumnName("message");
            entity.Property(e => e.Status)
                .HasDefaultValueSql("'pending'")
                .HasColumnType("enum('pending','accepted','declined')")
                .HasColumnName("status");

            entity.HasOne(d => d.Applicant).WithMany(p => p.InterviewApplicants)
                .HasForeignKey(d => d.ApplicantId)
                .HasConstraintName("interviews_ibfk_2");

            entity.HasOne(d => d.Employer).WithMany(p => p.InterviewEmployers)
                .HasForeignKey(d => d.EmployerId)
                .HasConstraintName("interviews_ibfk_3");

            entity.HasOne(d => d.Job).WithMany(p => p.Interviews)
                .HasForeignKey(d => d.JobId)
                .HasConstraintName("interviews_ibfk_1");
        });

        modelBuilder.Entity<JobField>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("job_fields");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Name)
                .HasMaxLength(100)
                .HasColumnName("name");
        });

        modelBuilder.Entity<JobPost>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("job_posts");

            entity.HasIndex(e => e.EmployerId, "employer_id");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.ApplyDeadline)
                .HasColumnType("datetime")
                .HasColumnName("apply_deadline");
            entity.Property(e => e.Description)
                .HasColumnType("text")
                .HasColumnName("description");
            entity.Property(e => e.EmployerId).HasColumnName("employer_id");
            entity.Property(e => e.Interest)
                .HasColumnType("text")
                .HasColumnName("interest");
            entity.Property(e => e.JobOpeningCount)
                .HasDefaultValueSql("'1'")
                .HasColumnName("job_opening_count");
            entity.Property(e => e.Location)
                .HasMaxLength(100)
                .HasColumnName("location");
            entity.Property(e => e.PostDate)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp")
                .HasColumnName("post_date");
            entity.Property(e => e.Requirements)
                .HasColumnType("text")
                .HasColumnName("requirements");
            entity.Property(e => e.SalaryRange)
                .HasMaxLength(50)
                .HasColumnName("salary_range");
            entity.Property(e => e.Status)
                .HasDefaultValueSql("'open'")
                .HasColumnType("enum('open','closed')")
                .HasColumnName("status");
            entity.Property(e => e.Title)
                .HasMaxLength(100)
                .HasColumnName("title");
            entity.Property(e => e.ViewCount)
                .HasDefaultValueSql("'0'")
                .HasColumnName("view_count");

            entity.HasOne(d => d.Employer).WithMany(p => p.JobPosts)
                .HasForeignKey(d => d.EmployerId)
                .HasConstraintName("job_posts_ibfk_1");
        });

        modelBuilder.Entity<JobPostEmploymentType>(entity =>
        {
            entity.HasKey(e => new { e.JobPostId, e.EmploymentTypeId })
                .HasName("PRIMARY")
                .HasAnnotation("MySql:IndexPrefixLength", new[] { 0, 0 });

            entity.ToTable("job_post_employment_types");

            entity.HasIndex(e => e.EmploymentTypeId, "employment_type_id");

            entity.Property(e => e.JobPostId).HasColumnName("job_post_id");
            entity.Property(e => e.EmploymentTypeId).HasColumnName("employment_type_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp")
                .HasColumnName("created_at");

            entity.HasOne(d => d.EmploymentType).WithMany(p => p.JobPostEmploymentTypes)
                .HasForeignKey(d => d.EmploymentTypeId)
                .HasConstraintName("job_post_employment_types_ibfk_2");

            entity.HasOne(d => d.JobPost).WithMany(p => p.JobPostEmploymentTypes)
                .HasForeignKey(d => d.JobPostId)
                .HasConstraintName("job_post_employment_types_ibfk_1");
        });

        modelBuilder.Entity<JobPostField>(entity =>
        {
            entity.HasKey(e => new { e.JobPostId, e.FieldId })
                .HasName("PRIMARY")
                .HasAnnotation("MySql:IndexPrefixLength", new[] { 0, 0 });

            entity.ToTable("job_post_fields");

            entity.HasIndex(e => e.FieldId, "field_id");

            entity.Property(e => e.JobPostId).HasColumnName("job_post_id");
            entity.Property(e => e.FieldId).HasColumnName("field_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp")
                .HasColumnName("created_at");

            entity.HasOne(d => d.Field).WithMany(p => p.JobPostFields)
                .HasForeignKey(d => d.FieldId)
                .HasConstraintName("job_post_fields_ibfk_2");

            entity.HasOne(d => d.JobPost).WithMany(p => p.JobPostFields)
                .HasForeignKey(d => d.JobPostId)
                .HasConstraintName("job_post_fields_ibfk_1");
        });

        modelBuilder.Entity<JobPostPromotion>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("job_post_promotions");

            entity.HasIndex(e => e.JobPostId, "job_post_id");

            entity.HasIndex(e => e.PackageId, "package_id");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp")
                .HasColumnName("created_at");
            entity.Property(e => e.EndDate)
                .HasColumnType("timestamp")
                .HasColumnName("end_date");
            entity.Property(e => e.JobPostId).HasColumnName("job_post_id");
            entity.Property(e => e.PackageId).HasColumnName("package_id");
            entity.Property(e => e.StartDate)
                .HasColumnType("timestamp")
                .HasColumnName("start_date");

            entity.HasOne(d => d.JobPost).WithMany(p => p.JobPostPromotions)
                .HasForeignKey(d => d.JobPostId)
                .HasConstraintName("job_post_promotions_ibfk_1");

            entity.HasOne(d => d.Package).WithMany(p => p.JobPostPromotions)
                .HasForeignKey(d => d.PackageId)
                .HasConstraintName("job_post_promotions_ibfk_2");
        });

        modelBuilder.Entity<JobPostReport>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("job_post_reports");

            entity.HasIndex(e => e.JobPostId, "job_post_id");

            entity.HasIndex(e => e.ReportedBy, "reported_by");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp")
                .HasColumnName("created_at");
            entity.Property(e => e.JobPostId).HasColumnName("job_post_id");
            entity.Property(e => e.Reason)
                .HasColumnType("text")
                .HasColumnName("reason");
            entity.Property(e => e.Description)
                .HasColumnType("text")
                .HasColumnName("description");
            entity.Property(e => e.ReportedBy).HasColumnName("reported_by");
            entity.Property(e => e.Status)
                .HasDefaultValueSql("'pending'")
                .HasColumnType("enum('pending','reviewed','resolved')")
                .HasColumnName("status");

            entity.HasOne(d => d.JobPost).WithMany(p => p.JobPostReports)
                .HasForeignKey(d => d.JobPostId)
                .HasConstraintName("job_post_reports_ibfk_1");

            entity.HasOne(d => d.ReportedByNavigation).WithMany(p => p.JobPostReports)
                .HasForeignKey(d => d.ReportedBy)
                .HasConstraintName("job_post_reports_ibfk_2");
        });

        modelBuilder.Entity<JobPostReview>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("job_post_reviews");

            entity.HasIndex(e => e.JobPostId, "job_post_id");

            entity.HasIndex(e => e.UserId, "user_id");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Comment)
                .HasColumnType("text")
                .HasColumnName("comment");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp")
                .HasColumnName("created_at");
            entity.Property(e => e.JobPostId).HasColumnName("job_post_id");
            entity.Property(e => e.Rating).HasColumnName("rating");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.JobPost).WithMany(p => p.JobPostReviews)
                .HasForeignKey(d => d.JobPostId)
                .HasConstraintName("job_post_reviews_ibfk_1");

            entity.HasOne(d => d.User).WithMany(p => p.JobPostReviews)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("job_post_reviews_ibfk_2");
        });

        modelBuilder.Entity<Package>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("packages");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp")
                .HasColumnName("created_at");
            entity.Property(e => e.Description)
                .HasColumnType("text")
                .HasColumnName("description");
            entity.Property(e => e.DurationDays).HasColumnName("duration_days");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .HasColumnName("name");
            entity.Property(e => e.Price)
                .HasPrecision(10, 2)
                .HasColumnName("price");
        });

        modelBuilder.Entity<ProPackage>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("pro_packages");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.Description)
                .HasColumnType("text")
                .HasColumnName("description");
            entity.Property(e => e.DurationDays).HasColumnName("duration_days");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .HasColumnName("name");
            entity.Property(e => e.Price)
                .HasPrecision(10, 2)
                .HasColumnName("price");
        });

        modelBuilder.Entity<ProSubscription>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("pro_subscriptions");

            entity.HasIndex(e => e.PackageId, "package_id");

            entity.HasIndex(e => e.UserId, "user_id");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.EndDate)
                .HasColumnType("datetime")
                .HasColumnName("end_date");
            entity.Property(e => e.PackageId).HasColumnName("package_id");
            entity.Property(e => e.StartDate)
                .HasColumnType("datetime")
                .HasColumnName("start_date");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.Package).WithMany(p => p.ProSubscriptions)
                .HasForeignKey(d => d.PackageId)
                .HasConstraintName("pro_subscriptions_ibfk_2");

            entity.HasOne(d => d.User).WithMany(p => p.ProSubscriptions)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("pro_subscriptions_ibfk_1");
        });

        modelBuilder.Entity<SavedJob>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("saved_jobs");

            entity.HasIndex(e => e.JobPostId, "job_post_id");

            entity.HasIndex(e => new { e.UserId, e.JobPostId }, "unique_user_job").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp")
                .HasColumnName("created_at");
            entity.Property(e => e.JobPostId).HasColumnName("job_post_id");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.JobPost).WithMany(p => p.SavedJobs)
                .HasForeignKey(d => d.JobPostId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("saved_jobs_ibfk_2");

            entity.HasOne(d => d.User).WithMany(p => p.SavedJobs)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("saved_jobs_ibfk_1");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("users");

            entity.HasIndex(e => e.Email, "email").IsUnique();

            entity.HasIndex(e => e.FacebookId, "facebook_id").IsUnique();

            entity.HasIndex(e => e.RoleId, "fk_users_role");

            entity.HasIndex(e => e.GoogleId, "google_id").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Avatar)
                .HasColumnType("text")
                .HasColumnName("avatar");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp")
                .HasColumnName("created_at");
            entity.Property(e => e.Email).HasColumnName("email");
            entity.Property(e => e.FacebookId).HasColumnName("facebook_id");
            entity.Property(e => e.GoogleId).HasColumnName("google_id");
            entity.Property(e => e.Password)
                .HasMaxLength(255)
                .HasColumnName("password");
            entity.Property(e => e.RoleId).HasColumnName("role_id");
            entity.Property(e => e.Username)
                .HasMaxLength(255)
                .HasColumnName("username");

            entity.HasOne(d => d.Role).WithMany(p => p.Users)
                .HasForeignKey(d => d.RoleId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_users_role");
        });

        modelBuilder.Entity<UserFollow>(entity =>
        {
            entity.HasKey(e => new { e.UserId, e.EmployerId })
                .HasName("PRIMARY")
                .HasAnnotation("MySql:IndexPrefixLength", new[] { 0, 0 });

            entity.ToTable("user_follows");

            entity.HasIndex(e => e.EmployerId, "employer_id");

            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.EmployerId).HasColumnName("employer_id");
            entity.Property(e => e.FollowedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp")
                .HasColumnName("followed_at");

            entity.HasOne(d => d.Employer).WithMany(p => p.UserFollowEmployers)
                .HasForeignKey(d => d.EmployerId)
                .HasConstraintName("user_follows_ibfk_2");

            entity.HasOne(d => d.User).WithMany(p => p.UserFollowUsers)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("user_follows_ibfk_1");
        });

        modelBuilder.Entity<UserRole>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("user_roles");

            entity.HasIndex(e => e.Name, "name").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Name)
                .HasMaxLength(50)
                .HasColumnName("name");
        });

        modelBuilder.Entity<Warning>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("warnings");

            entity.HasIndex(e => e.EmployerId, "employer_id");

            entity.HasIndex(e => e.JobPostId, "job_post_id");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp")
                .HasColumnName("created_at");
            entity.Property(e => e.EmployerId).HasColumnName("employer_id");
            entity.Property(e => e.JobPostId).HasColumnName("job_post_id");
            entity.Property(e => e.WarningMessage)
                .HasColumnType("text")
                .HasColumnName("warning_message");

            entity.HasOne(d => d.Employer).WithMany(p => p.Warnings)
                .HasForeignKey(d => d.EmployerId)
                .HasConstraintName("warnings_ibfk_1");

            entity.HasOne(d => d.JobPost).WithMany(p => p.Warnings)
                .HasForeignKey(d => d.JobPostId)
                .HasConstraintName("warnings_ibfk_2");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
