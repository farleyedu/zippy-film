using ZippyFilms.Api.DTOs;
using ZippyFilms.Api.Repositories;

namespace ZippyFilms.Api.Services;

public sealed class ProfileService(IProfileRepository profileRepository)
{
    public async Task<IReadOnlyCollection<ProfileResponse>> GetAsync(Guid userId)
    {
        var profiles = await profileRepository.GetByUserAsync(userId);
        return profiles.Select(static profile => new ProfileResponse(profile.Id, profile.Name, profile.Avatar, profile.IsKids, profile.Language, profile.MaturityLevel)).ToArray();
    }

    public async Task<ProfileResponse> CreateAsync(Guid userId, CreateProfileRequest request)
    {
        var profile = await profileRepository.CreateAsync(userId, request.Name, request.Avatar, request.IsKids);
        return new ProfileResponse(profile.Id, profile.Name, profile.Avatar, profile.IsKids, profile.Language, profile.MaturityLevel);
    }

    public async Task<ProfileResponse?> UpdateAsync(Guid id, UpdateProfileRequest request)
    {
        var profile = await profileRepository.UpdateAsync(id, request.Name, request.Avatar, request.IsKids, request.Language, request.MaturityLevel);
        return profile is null ? null : new ProfileResponse(profile.Id, profile.Name, profile.Avatar, profile.IsKids, profile.Language, profile.MaturityLevel);
    }
}
