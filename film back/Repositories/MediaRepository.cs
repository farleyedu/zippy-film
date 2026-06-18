using Dapper;
using ZippyFilms.Api.Infrastructure;
using ZippyFilms.Api.Models;

namespace ZippyFilms.Api.Repositories;

public sealed class MediaRepository(IDbConnectionFactory connectionFactory) : IMediaRepository
{
    public async Task<IReadOnlyCollection<MediaSummary>> GetByTypeAsync(string type)
    {
        using var connection = connectionFactory.CreateConnection();
        var media = await connection.QueryAsync<MediaSummary>("""
            select id, type, title, year, overview, poster_url as PosterUrl, backdrop_url as BackdropUrl, vote_average as VoteAverage, status
            from zippyfilms.media
            where type = @Type and status <> 'HIDDEN'
            order by created_at desc
            limit 80
            """, new { Type = type });
        return media.ToArray();
    }

    public async Task<MediaSummary?> GetByIdAsync(Guid id)
    {
        using var connection = connectionFactory.CreateConnection();
        return await connection.QuerySingleOrDefaultAsync<MediaSummary>("""
            select id, type, title, year, overview, poster_url as PosterUrl, backdrop_url as BackdropUrl, vote_average as VoteAverage, status
            from zippyfilms.media
            where id = @Id
            """, new { Id = id });
    }

    public async Task<IReadOnlyCollection<MediaSummary>> SearchAsync(string query)
    {
        using var connection = connectionFactory.CreateConnection();
        var media = await connection.QueryAsync<MediaSummary>("""
            select id, type, title, year, overview, poster_url as PosterUrl, backdrop_url as BackdropUrl, vote_average as VoteAverage, status
            from zippyfilms.media
            where lower(title) like lower(@Query)
            order by title
            limit 50
            """, new { Query = $"%{query}%" });
        return media.ToArray();
    }
}
