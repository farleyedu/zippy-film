using ZippyFilms.Api.Services;

namespace ZippyFilms.Api.BackgroundServices;

public sealed class ScannerWorker(IServiceScopeFactory scopeFactory, ILogger<ScannerWorker> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        logger.LogInformation("ScannerWorker iniciado.");
        while (!stoppingToken.IsCancellationRequested)
        {
            using var scope = scopeFactory.CreateScope();
            await scope.ServiceProvider.GetRequiredService<ScannerService>().RunAsync(stoppingToken);
            await Task.Delay(TimeSpan.FromMinutes(10), stoppingToken);
        }
    }
}
