using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ZippyFilms.Api.DTOs;
using ZippyFilms.Api.Models;
using ZippyFilms.Api.Services;

namespace ZippyFilms.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/playback")]
public sealed class PlaybackController(PlaybackService playbackService) : ControllerBase
{
    [HttpGet("{playableItemId:guid}")]
    public async Task<ActionResult<PlaybackInfo>> Get(Guid playableItemId)
    {
        var info = await playbackService.GetAsync(playableItemId);
        return info is null ? NotFound() : Ok(info);
    }

    [HttpPost("{playableItemId:guid}/start")]
    public IActionResult Start(Guid playableItemId) => Accepted(new { playableItemId });

    [HttpPost("{playableItemId:guid}/progress")]
    public async Task<IActionResult> Progress(Guid playableItemId, PlaybackProgressRequest request)
    {
        await playbackService.SaveProgressAsync(playableItemId, request);
        return NoContent();
    }

    [HttpPost("{playableItemId:guid}/finish")]
    public async Task<IActionResult> Finish(Guid playableItemId, PlaybackProgressRequest request)
    {
        await playbackService.SaveProgressAsync(playableItemId, request with { CurrentTimeSeconds = request.DurationSeconds });
        return NoContent();
    }
}
