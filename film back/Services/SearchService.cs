using ZippyFilms.Api.DTOs;
using ZippyFilms.Api.Repositories;

namespace ZippyFilms.Api.Services;

public sealed class SearchService(IMediaRepository mediaRepository)
{
    public async Task<IReadOnlyCollection<MediaResponse>> SearchAsync(string? query)
    {
        if (string.IsNullOrWhiteSpace(query))
        {
            return [];
        }

        var results = await mediaRepository.SearchAsync(query.Trim());
        return results.Select(static media => new MediaResponse(media.Id, media.Type, media.Title, media.Year, media.Overview, media.PosterUrl, media.BackdropUrl, media.VoteAverage, media.Status)).ToArray();
    }
}
