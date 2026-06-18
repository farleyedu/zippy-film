using ZippyFilms.Api.Models;

namespace ZippyFilms.Api.Repositories;

public interface IProfileRepository
{
    Task<IReadOnlyCollection<Profile>> GetByUserAsync(Guid userId);
    Task<Profile> CreateAsync(Guid userId, string name, string? avatar, bool isKids);
    Task<Profile?> UpdateAsync(Guid id, string name, string? avatar, bool isKids, string language, string maturityLevel);
}
