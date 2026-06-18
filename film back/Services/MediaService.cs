using ZippyFilms.Api.DTOs;
using ZippyFilms.Api.Models;
using ZippyFilms.Api.Repositories;

namespace ZippyFilms.Api.Services;

public sealed class MediaService(IMediaRepository mediaRepository)
{
    public async Task<HomeResponse> GetHomeAsync()
    {
        var movies = await mediaRepository.GetByTypeAsync("MOVIE");
        var series = await mediaRepository.GetByTypeAsync("SERIES");
        var hero = movies.FirstOrDefault() ?? series.FirstOrDefault();
        return new HomeResponse(hero is null ? null : ToDto(hero), [
            new MediaRowResponse("Continuar assistindo", []),
            new MediaRowResponse("Filmes adicionados recentemente", movies.Select(ToDto).ToArray()),
            new MediaRowResponse("Series para maratonar", series.Select(ToDto).ToArray()),
            new MediaRowResponse("Acao e aventura", movies.Take(20).Select(ToDto).ToArray()),
            new MediaRowResponse("Minha lista", [])
        ]);
    }

    public async Task<IReadOnlyCollection<MediaResponse>> GetMoviesAsync() => (await mediaRepository.GetByTypeAsync("MOVIE")).Select(ToDto).ToArray();

    public async Task<IReadOnlyCollection<MediaResponse>> GetSeriesAsync() => (await mediaRepository.GetByTypeAsync("SERIES")).Select(ToDto).ToArray();

    public async Task<MediaResponse?> GetByIdAsync(Guid id)
    {
        var media = await mediaRepository.GetByIdAsync(id);
        return media is null ? null : ToDto(media);
    }

    private static MediaResponse ToDto(MediaSummary media)
    {
        return new MediaResponse(media.Id, media.Type, media.Title, media.Year, media.Overview, media.PosterUrl, media.BackdropUrl, media.VoteAverage, media.Status);
    }
}
