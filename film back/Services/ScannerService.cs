using ZippyFilms.Api.Options;
using Microsoft.Extensions.Options;

namespace ZippyFilms.Api.Services;

public sealed class ScannerService(IOptions<MediaStorageOptions> options, ILogger<ScannerService> logger)
{
    public Task RunAsync(CancellationToken cancellationToken = default)
    {
        logger.LogInformation("Scanner preparado. MoviesPath={MoviesPath}, SeriesPath={SeriesPath}", options.Value.MOVIES_PATH, options.Value.SERIES_PATH);
        return Task.CompletedTask;
    }
}
