using Dapper;
using ZippyFilms.Api.Infrastructure;
using ZippyFilms.Api.Models;

namespace ZippyFilms.Api.Repositories;

public sealed class ProfileRepository(IDbConnectionFactory connectionFactory) : IProfileRepository
{
    public async Task<IReadOnlyCollection<Profile>> GetByUserAsync(Guid userId)
    {
        using var connection = connectionFactory.CreateConnection();
        var profiles = await connection.QueryAsync<Profile>("""
            select id, user_id as UserId, name, avatar, is_kids as IsKids, language, maturity_level as MaturityLevel
            from zippyfilms.profiles
            where user_id = @UserId
            order by created_at
            """, new { UserId = userId });
        return profiles.ToArray();
    }

    public async Task<Profile> CreateAsync(Guid userId, string name, string? avatar, bool isKids)
    {
        using var connection = connectionFactory.CreateConnection();
        return await connection.QuerySingleAsync<Profile>("""
            insert into zippyfilms.profiles (id, user_id, name, avatar, is_kids, language, maturity_level)
            values (@Id, @UserId, @Name, @Avatar, @IsKids, 'pt-BR', 'ALL')
            returning id, user_id as UserId, name, avatar, is_kids as IsKids, language, maturity_level as MaturityLevel
            """, new
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Name = name,
            Avatar = avatar ?? name[..1].ToUpperInvariant(),
            IsKids = isKids
        });
    }

    public async Task<Profile?> UpdateAsync(Guid id, string name, string? avatar, bool isKids, string language, string maturityLevel)
    {
        using var connection = connectionFactory.CreateConnection();
        return await connection.QuerySingleOrDefaultAsync<Profile>("""
            update zippyfilms.profiles
            set name = @Name, avatar = @Avatar, is_kids = @IsKids, language = @Language, maturity_level = @MaturityLevel
            where id = @Id
            returning id, user_id as UserId, name, avatar, is_kids as IsKids, language, maturity_level as MaturityLevel
            """, new { Id = id, Name = name, Avatar = avatar ?? name[..1].ToUpperInvariant(), IsKids = isKids, Language = language, MaturityLevel = maturityLevel });
    }
}
