using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ZippyFilms.Api.DTOs;
using ZippyFilms.Api.Services;

namespace ZippyFilms.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/media")]
public sealed class MediaController(MediaService mediaService) : ControllerBase
{
    [HttpGet("movies")]
    public async Task<ActionResult<IReadOnlyCollection<MediaResponse>>> Movies() => Ok(await mediaService.GetMoviesAsync());

    [HttpGet("series")]
    public async Task<ActionResult<IReadOnlyCollection<MediaResponse>>> Series() => Ok(await mediaService.GetSeriesAsync());

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<MediaResponse>> Detail(Guid id)
    {
        var media = await mediaService.GetByIdAsync(id);
        return media is null ? NotFound() : Ok(media);
    }

    [HttpGet("{id:guid}/seasons")]
    public IActionResult Seasons(Guid id) => Ok(Array.Empty<object>());

    [HttpGet("{id:guid}/seasons/{seasonNumber:int}")]
    public IActionResult Season(Guid id, int seasonNumber) => Ok(new { id, seasonNumber, episodes = Array.Empty<object>() });

    [HttpGet("{id:guid}/episodes")]
    public IActionResult Episodes(Guid id) => Ok(Array.Empty<object>());
}
