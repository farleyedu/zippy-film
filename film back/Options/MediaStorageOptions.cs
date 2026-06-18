namespace ZippyFilms.Api.Options;

public sealed class MediaStorageOptions
{
    public string? MEDIA_ROOT_PATH { get; init; }
    public string? MOVIES_PATH { get; init; }
    public string? SERIES_PATH { get; init; }
    public string FFMPEG_PATH { get; init; } = "ffmpeg";
    public string FFPROBE_PATH { get; init; } = "ffprobe";
}
