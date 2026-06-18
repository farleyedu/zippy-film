namespace ZippyFilms.Api.Models;

public sealed class PlaybackInfo
{
    public Guid PlayableItemId { get; init; }
    public string Title { get; init; } = "";
    public string HlsUrl { get; init; } = "";
    public int DurationSeconds { get; init; }
    public IReadOnlyCollection<string> Qualities { get; set; } = [];
    public IReadOnlyCollection<string> AudioTracks { get; set; } = [];
    public IReadOnlyCollection<string> SubtitleTracks { get; set; } = [];
}
