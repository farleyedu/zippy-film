using ZippyFilms.Api.DTOs;
using ZippyFilms.Api.Models;
using ZippyFilms.Api.Repositories;

namespace ZippyFilms.Api.Services;

public sealed class PlaybackService(IPlaybackRepository playbackRepository)
{
    public Task<PlaybackInfo?> GetAsync(Guid playableItemId) => playbackRepository.GetPlaybackInfoAsync(playableItemId);

    public Task SaveProgressAsync(Guid playableItemId, PlaybackProgressRequest request)
    {
        return playbackRepository.SaveProgressAsync(request.ProfileId, playableItemId, request.CurrentTimeSeconds, request.DurationSeconds);
    }
}
