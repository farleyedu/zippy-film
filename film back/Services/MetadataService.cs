using ZippyFilms.Api.Options;
using Microsoft.Extensions.Options;

namespace ZippyFilms.Api.Services;

public sealed class MetadataService(IOptions<TmdbOptions> options, ILogger<MetadataService> logger)
{
    public Task SyncAsync(string title, CancellationToken cancellationToken = default)
    {
        logger.LogInformation("MetadataService preparado para TMDB. Title={Title}, Language={Language}, HasKey={HasKey}", title, options.Value.TMDB_LANGUAGE, !string.IsNullOrWhiteSpace(options.Value.TMDB_API_KEY));
        return Task.CompletedTask;
    }
}
