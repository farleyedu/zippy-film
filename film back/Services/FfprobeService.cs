using ZippyFilms.Api.Options;
using Microsoft.Extensions.Options;

namespace ZippyFilms.Api.Services;

public sealed class FfprobeService(IOptions<MediaStorageOptions> options)
{
    public string GetCommandPath() => options.Value.FFPROBE_PATH;
}
