using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ZippyFilms.Api.DTOs;
using ZippyFilms.Api.Services;

namespace ZippyFilms.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/search")]
public sealed class SearchController(SearchService searchService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyCollection<MediaResponse>>> Search([FromQuery] string? q)
    {
        return Ok(await searchService.SearchAsync(q));
    }
}
