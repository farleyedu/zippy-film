using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ZippyFilms.Api.Services;

namespace ZippyFilms.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/settings")]
public sealed class SettingsController(SettingsService settingsService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get() => Ok(await settingsService.GetAsync());

    [HttpPut]
    public async Task<IActionResult> Put(Dictionary<string, object> request)
    {
        await settingsService.SaveAsync(request);
        return NoContent();
    }
}
