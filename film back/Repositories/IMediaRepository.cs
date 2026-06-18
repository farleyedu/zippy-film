using ZippyFilms.Api.Models;

namespace ZippyFilms.Api.Repositories;

public interface IMediaRepository
{
    Task<IReadOnlyCollection<MediaSummary>> GetByTypeAsync(string type);
    Task<MediaSummary?> GetByIdAsync(Guid id);
    Task<IReadOnlyCollection<MediaSummary>> SearchAsync(string query);
}
