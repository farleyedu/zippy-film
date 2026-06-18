using ZippyFilms.Api.Repositories;

namespace ZippyFilms.Api.Services;

public sealed class SettingsService(ISettingsRepository settingsRepository)
{
    public Task<IReadOnlyDictionary<string, object>> GetAsync() => settingsRepository.GetAsync();
    public Task SaveAsync(Dictionary<string, object> settings) => settingsRepository.SaveAsync(settings);
}
