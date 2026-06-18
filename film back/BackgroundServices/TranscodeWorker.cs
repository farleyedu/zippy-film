using ZippyFilms.Api.Services;

namespace ZippyFilms.Api.BackgroundServices;

public sealed class TranscodeWorker(IServiceScopeFactory scopeFactory, ILogger<TranscodeWorker> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        logger.LogInformation("TranscodeWorker iniciado.");
        while (!stoppingToken.IsCancellationRequested)
        {
            using var scope = scopeFactory.CreateScope();
            await scope.ServiceProvider.GetRequiredService<TranscodeService>().ProcessPendingAsync(stoppingToken);
            await Task.Delay(TimeSpan.FromMinutes(2), stoppingToken);
        }
    }
}
