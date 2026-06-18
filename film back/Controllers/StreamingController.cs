using Microsoft.AspNetCore.Mvc;

namespace ZippyFilms.Api.Controllers;

[ApiController]
public sealed class StreamingController : ControllerBase
{
    [HttpGet("media-stream/{playableItemId:guid}/master.m3u8")]
    public IActionResult Master(Guid playableItemId)
    {
        return Content("#EXTM3U\n#EXT-X-VERSION:3\n", "application/vnd.apple.mpegurl");
    }

    [HttpGet("media-stream/{playableItemId:guid}/{quality}/{segment}")]
    public IActionResult Segment(Guid playableItemId, string quality, string segment)
    {
        return NotFound(new { playableItemId, quality, segment, message = "Segmento HLS ainda nao gerado." });
    }
}
