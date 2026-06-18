using ZippyFilms.Api.Options;
using Microsoft.Extensions.Options;

namespace ZippyFilms.Api.Services;

public sealed class TranscodeService(IOptions<MediaStorageOptions> options, ILogger<TranscodeService> logger)
{
    public Task ProcessPendingAsync(CancellationToken cancellationToken = default)
    {
        logger.LogInformation("TranscodeService preparado com FFmpeg em {Path}", options.Value.FFMPEG_PATH);
        return Task.CompletedTask;
    }
}
