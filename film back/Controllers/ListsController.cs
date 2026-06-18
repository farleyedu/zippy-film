using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ZippyFilms.Api.DTOs;
using ZippyFilms.Api.Services;

namespace ZippyFilms.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/lists")]
public sealed class ListsController(ListService listService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] Guid? profileId) => Ok(await listService.GetAsync(profileId));

    [HttpPost]
    public async Task<IActionResult> Add(ListRequest request)
    {
        await listService.AddAsync(request);
        return Created("/api/lists", null);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await listService.DeleteAsync(id);
        return NoContent();
    }
}
