using Dapper;
using ZippyFilms.Api.Infrastructure;
using ZippyFilms.Api.Models;

namespace ZippyFilms.Api.Repositories;

public sealed class AuthRepository(IDbConnectionFactory connectionFactory) : IAuthRepository
{
    public async Task<User?> GetByEmailAsync(string email)
    {
        using var connection = connectionFactory.CreateConnection();
        return await connection.QuerySingleOrDefaultAsync<User>("""
            select id, name, email, password_hash as PasswordHash, pin_hash as PinHash, role, status
            from zippyfilms.users
            where email = @Email and status = 'ACTIVE'
            """, new { Email = email.ToLowerInvariant() });
    }

    public async Task<User?> GetByIdAsync(Guid id)
    {
        using var connection = connectionFactory.CreateConnection();
        return await connection.QuerySingleOrDefaultAsync<User>("""
            select id, name, email, password_hash as PasswordHash, pin_hash as PinHash, role, status
            from zippyfilms.users
            where id = @Id and status = 'ACTIVE'
            """, new { Id = id });
    }

    public async Task<User> CreateAsync(string name, string email, string passwordHash, string? pinHash)
    {
        using var connection = connectionFactory.CreateConnection();
        var user = await connection.QuerySingleAsync<User>("""
            insert into zippyfilms.users (id, name, email, password_hash, pin_hash, role, status)
            values (@Id, @Name, @Email, @PasswordHash, @PinHash, 'USER', 'ACTIVE')
            returning id, name, email, password_hash as PasswordHash, pin_hash as PinHash, role, status
            """, new
        {
            Id = Guid.NewGuid(),
            Name = name,
            Email = email.ToLowerInvariant(),
            PasswordHash = passwordHash,
            PinHash = pinHash
        });

        await connection.ExecuteAsync("""
            insert into zippyfilms.profiles (id, user_id, name, avatar, is_kids, language, maturity_level)
            values (@Id, @UserId, @Name, @Avatar, false, 'pt-BR', 'ALL')
            """, new
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            user.Name,
            Avatar = user.Name[..1].ToUpperInvariant()
        });

        return user;
    }

    public async Task TouchLoginAsync(Guid userId)
    {
        using var connection = connectionFactory.CreateConnection();
        await connection.ExecuteAsync("update zippyfilms.users set last_login_at = now() where id = @UserId", new { UserId = userId });
    }
}
