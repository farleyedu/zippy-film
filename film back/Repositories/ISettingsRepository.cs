namespace ZippyFilms.Api.Repositories;

public interface ISettingsRepository
{
    Task<IReadOnlyDictionary<string, object>> GetAsync();
    Task SaveAsync(Dictionary<string, object> settings);
}
