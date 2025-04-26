using BACKEND.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;

public class TopMaxPostDateUpdaterService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly TimeSpan _interval = TimeSpan.FromDays(1); // chạy mỗi 1 ngày

    public TopMaxPostDateUpdaterService(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        // Delay lần đầu: ví dụ nếu muốn bắt đầu từ 2h sáng mỗi ngày
        var now = DateTime.Now;
        var targetTime = DateTime.Today.AddHours(2); // 2h sáng
        if (now > targetTime)
        {
            targetTime = targetTime.AddDays(1);
        }
        var initialDelay = targetTime - now;
        await Task.Delay(initialDelay, stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<TopcvBeContext>();
                var nowUtc = DateTime.UtcNow;

                var topMaxJobs = from promo in dbContext.JobPostPromotions
                                 join job in dbContext.JobPosts on promo.JobPostId equals job.Id
                                 where promo.Package.HighlightType == "TopMax"
                                       && promo.StartDate <= nowUtc
                                       && promo.EndDate >= nowUtc
                                       && job.Status == "open"
                                 select job;

                var jobsToUpdate = await topMaxJobs.ToListAsync(stoppingToken);

                foreach (var job in jobsToUpdate)
                {
                    job.PostDate = nowUtc;
                }

                await dbContext.SaveChangesAsync(stoppingToken);
            }

            await Task.Delay(_interval, stoppingToken);
        }
    }
}
