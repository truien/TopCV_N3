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

    public virtual DbSet<AdminUser> AdminUsers { get; set; }

    public virtual DbSet<Application> Applications { get; set; }

    public virtual DbSet<CandidateProfile> CandidateProfiles { get; set; }

    public virtual DbSet<CompanyProfile> CompanyProfiles { get; set; }

    public virtual DbSet<EmploymentType> EmploymentTypes { get; set; }

    public virtual DbSet<JobField> JobFields { get; set; }

    public virtual DbSet<JobPost> JobPosts { get; set; }

    public virtual DbSet<JobPostEmploymentType> JobPostEmploymentTypes { get; set; }

    public virtual DbSet<JobPostField> JobPostFields { get; set; }

    public virtual DbSet<JobPostPromotion> JobPostPromotions { get; set; }

    public virtual DbSet<Notification> Notifications { get; set; }

    public virtual DbSet<OauthAccount> OauthAccounts { get; set; }

    public virtual DbSet<Package> Packages { get; set; }

    public virtual DbSet<ProFeature> ProFeatures { get; set; }

    public virtual DbSet<ProSubscription> ProSubscriptions { get; set; }

    public virtual DbSet<ProSubscriptionFeature> ProSubscriptionFeatures { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<UserFollow> UserFollows { get; set; }

    public virtual DbSet<UserRole> UserRoles { get; set; }

    public virtual DbSet<UserToken> UserTokens { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        => optionsBuilder.UseMySql("server=localhost;database=topcv_be;user=root;password=admin", Microsoft.EntityFrameworkCore.ServerVersion.Parse("8.0.40-mysql"));

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder
            .UseCollation("utf8mb4_0900_ai_ci")
            .HasCharSet("utf8mb4");

        modelBuilder.Entity<AdminUser>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PRIMARY");

            entity.ToTable("admin_users");

            entity.Property(e => e.UserId)
                .ValueGeneratedNever()
                .HasColumnName("user_id");

            entity.HasOne(d => d.User).WithOne(p => p.AdminUser)
                .HasForeignKey<AdminUser>(d => d.UserId)
                .HasConstraintName("admin_users_ibfk_1");
        });

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
            entity.Property(e => e.Status)
                .HasDefaultValueSql("'pending'")
                .HasColumnType("enum('pending','accepted','rejected')")
                .HasColumnName("status");
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
            entity.Property(e => e.CvTitle)
                .HasMaxLength(255)
                .HasColumnName("cv_title");
            entity.Property(e => e.DateOfBirth).HasColumnName("date_of_birth");
            entity.Property(e => e.Education)
                .HasColumnType("text")
                .HasColumnName("education");
            entity.Property(e => e.Experience)
                .HasColumnType("text")
                .HasColumnName("experience");
            entity.Property(e => e.Gender)
                .HasColumnType("enum('male','female','other')")
                .HasColumnName("gender");
            entity.Property(e => e.Phone)
                .HasMaxLength(15)
                .HasColumnName("phone");
            entity.Property(e => e.Skills)
                .HasColumnType("text")
                .HasColumnName("skills");
            entity.Property(e => e.Summary)
                .HasColumnType("text")
                .HasColumnName("summary");
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
            entity.Property(e => e.Description)
                .HasColumnType("text")
                .HasColumnName("description");
            entity.Property(e => e.EmployerId).HasColumnName("employer_id");
            entity.Property(e => e.Interest)
                .HasColumnType("text")
                .HasColumnName("interest");
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

        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("notifications");

            entity.HasIndex(e => e.UserId, "user_id");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp")
                .HasColumnName("created_at");
            entity.Property(e => e.IsRead)
                .HasDefaultValueSql("'0'")
                .HasColumnName("is_read");
            entity.Property(e => e.Message)
                .HasColumnType("text")
                .HasColumnName("message");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.User).WithMany(p => p.Notifications)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("notifications_ibfk_1");
        });

        modelBuilder.Entity<OauthAccount>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("oauth_accounts");

            entity.HasIndex(e => e.ProviderId, "provider_id").IsUnique();

            entity.HasIndex(e => e.UserId, "user_id");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Provider)
                .HasColumnType("enum('google','facebook')")
                .HasColumnName("provider");
            entity.Property(e => e.ProviderId).HasColumnName("provider_id");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.User).WithMany(p => p.OauthAccounts)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("oauth_accounts_ibfk_1");
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

        modelBuilder.Entity<ProFeature>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("pro_features");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Description)
                .HasColumnType("text")
                .HasColumnName("description");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .HasColumnName("name");
        });

        modelBuilder.Entity<ProSubscription>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("pro_subscriptions");

            entity.HasIndex(e => e.UserId, "user_id");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp")
                .HasColumnName("created_at");
            entity.Property(e => e.EndDate)
                .HasColumnType("timestamp")
                .HasColumnName("end_date");
            entity.Property(e => e.StartDate)
                .HasColumnType("timestamp")
                .HasColumnName("start_date");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.User).WithMany(p => p.ProSubscriptions)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("pro_subscriptions_ibfk_1");
        });

        modelBuilder.Entity<ProSubscriptionFeature>(entity =>
        {
            entity.HasKey(e => new { e.ProSubscriptionId, e.ProFeatureId })
                .HasName("PRIMARY")
                .HasAnnotation("MySql:IndexPrefixLength", new[] { 0, 0 });

            entity.ToTable("pro_subscription_features");

            entity.HasIndex(e => e.ProFeatureId, "pro_feature_id");

            entity.Property(e => e.ProSubscriptionId).HasColumnName("pro_subscription_id");
            entity.Property(e => e.ProFeatureId).HasColumnName("pro_feature_id");
            entity.Property(e => e.CreatedAt)
                .HasColumnType("datetime")
                .HasColumnName("created at");

            entity.HasOne(d => d.ProFeature).WithMany(p => p.ProSubscriptionFeatures)
                .HasForeignKey(d => d.ProFeatureId)
                .HasConstraintName("pro_subscription_features_ibfk_2");

            entity.HasOne(d => d.ProSubscription).WithMany(p => p.ProSubscriptionFeatures)
                .HasForeignKey(d => d.ProSubscriptionId)
                .HasConstraintName("pro_subscription_features_ibfk_1");
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
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp")
                .HasColumnName("created_at");
            entity.Property(e => e.Email).HasColumnName("email");
            entity.Property(e => e.FacebookId).HasColumnName("facebook_id");
            entity.Property(e => e.GoogleId).HasColumnName("google_id");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .HasColumnName("name");
            entity.Property(e => e.Password)
                .HasMaxLength(255)
                .HasColumnName("password");
            entity.Property(e => e.Role)
                .HasColumnType("enum('candidate','recruiter','admin')")
                .HasColumnName("role");
            entity.Property(e => e.RoleId).HasColumnName("role_id");

            entity.HasOne(d => d.RoleNavigation).WithMany(p => p.Users)
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

        modelBuilder.Entity<UserToken>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("user_tokens");

            entity.HasIndex(e => e.UserId, "user_id");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.ExpiresAt)
                .HasColumnType("timestamp")
                .HasColumnName("expires_at");
            entity.Property(e => e.RefreshToken)
                .HasColumnType("text")
                .HasColumnName("refresh_token");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.User).WithMany(p => p.UserTokens)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("user_tokens_ibfk_1");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
