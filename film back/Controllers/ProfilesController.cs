using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ZippyFilms.Api.Common;
using ZippyFilms.Api.DTOs;
using ZippyFilms.Api.Services;

namespace ZippyFilms.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/profiles")]
public sealed class ProfilesController(ProfileService profileService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyCollection<ProfileResponse>>> Get()
    {
        return Ok(await profileService.GetAsync(User.GetUserId()));
    }

    [HttpPost]
    public async Task<ActionResult<ProfileResponse>> Create(CreateProfileRequest request)
    {
        var profile = await profileService.CreateAsync(User.GetUserId(), request);
        return Created($"/api/profiles/{profile.Id}", profile);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ProfileResponse>> Update(Guid id, UpdateProfileRequest request)
    {
        var profile = await profileService.UpdateAsync(id, request);
        return profile is null ? NotFound() : Ok(profile);
    }

    [HttpPost("select")]
    [HttpPost("{id:guid}/select")]
    public IActionResult Select(Guid? id, SelectProfileRequest? request)
    {
        return Ok(new { profileId = id ?? request?.ProfileId });
    }
}
