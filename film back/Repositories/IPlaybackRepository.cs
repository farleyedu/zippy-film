using ZippyFilms.Api.Models;

namespace ZippyFilms.Api.Repositories;

public interface IPlaybackRepository
{
    Task<PlaybackInfo?> GetPlaybackInfoAsync(Guid playableItemId);
    Task SaveProgressAsync(Guid profileId, Guid playableItemId, int currentTimeSeconds, int durationSeconds);
}
