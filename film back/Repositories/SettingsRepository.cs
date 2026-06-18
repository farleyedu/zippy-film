using Dapper;
using ZippyFilms.Api.Infrastructure;

namespace ZippyFilms.Api.Repositories;

public sealed class SettingsRepository(IDbConnectionFactory connectionFactory) : ISettingsRepository
{
    public async Task<IReadOnlyDictionary<string, object>> GetAsync()
    {
        using var connection = connectionFactory.CreateConnection();
        var rows = await connection.QueryAsync<(string Key, string Value)>("select key, value::text as Value from zippyfilms.app_settings order by key");
        return rows.ToDictionary(row => row.Key, row => (object)row.Value);
    }

    public async Task SaveAsync(Dictionary<string, object> settings)
    {
        using var connection = connectionFactory.CreateConnection();
        foreach (var item in settings)
        {
            await connection.ExecuteAsync("""
                insert into zippyfilms.app_settings (key, value)
                values (@Key, cast(@Value as jsonb))
                on conflict (key) do update set value = excluded.value, updated_at = now()
                """, new { item.Key, Value = System.Text.Json.JsonSerializer.Serialize(item.Value) });
        }
    }
}
