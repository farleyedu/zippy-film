using ZippyFilms.Api.Models;

namespace ZippyFilms.Api.Repositories;

public interface IAuthRepository
{
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetByIdAsync(Guid id);
    Task<User> CreateAsync(string name, string email, string passwordHash, string? pinHash);
    Task TouchLoginAsync(Guid userId);
}
