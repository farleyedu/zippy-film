using Dapper;
using ZippyFilms.Api.DTOs;
using ZippyFilms.Api.Infrastructure;

namespace ZippyFilms.Api.Services;

public sealed class ListService(IDbConnectionFactory connectionFactory)
{
    public async Task<IReadOnlyCollection<object>> GetAsync(Guid? profileId)
    {
        if (profileId is null)
        {
            return [];
        }

        using var connection = connectionFactory.CreateConnection();
        var items = await connection.QueryAsync("""
            select pli.id, pli.list_type as listType, m.id as mediaId, m.title, m.type, m.poster_url as posterUrl
            from zippyfilms.profile_list_items pli
            join zippyfilms.media m on m.id = pli.media_id
            where pli.profile_id = @ProfileId
            order by pli.created_at desc
            """, new { ProfileId = profileId });
        return items.Select(static item => (object)item).ToArray();
    }

    public async Task AddAsync(ListRequest request)
    {
        using var connection = connectionFactory.CreateConnection();
        await connection.ExecuteAsync("""
            insert into zippyfilms.profile_list_items (id, profile_id, media_id, list_type)
            values (@Id, @ProfileId, @MediaId, @ListType)
            on conflict (profile_id, media_id, list_type) do nothing
            """, new { Id = Guid.NewGuid(), request.ProfileId, request.MediaId, request.ListType });
    }

    public async Task DeleteAsync(Guid id)
    {
        using var connection = connectionFactory.CreateConnection();
        await connection.ExecuteAsync("delete from zippyfilms.profile_list_items where id = @Id", new { Id = id });
    }
}
