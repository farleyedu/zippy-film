using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ZippyFilms.Api.DTOs;
using ZippyFilms.Api.Services;

namespace ZippyFilms.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/home")]
public sealed class HomeController(MediaService mediaService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<HomeResponse>> Get() => Ok(await mediaService.GetHomeAsync());
}
