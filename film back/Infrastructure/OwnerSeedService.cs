using Dapper;
using ZippyFilms.Api.Models;

namespace ZippyFilms.Api.Infrastructure;

public sealed class OwnerSeedService(IDbConnectionFactory connectionFactory, IConfiguration configuration, ILogger<OwnerSeedService> logger)
{
    public async Task SeedAsync()
    {
        using var connection = connectionFactory.CreateConnection();
        var ownerCount = await connection.ExecuteScalarAsync<int>("select count(*) from zippyfilms.users where role = 'OWNER'");
        if (ownerCount > 0)
        {
            return;
        }

        var name = configuration["SEED_OWNER_NAME"] ?? "Farley";
        var email = configuration["SEED_OWNER_EMAIL"] ?? "farleysilvae@gmail.com";
        var password = configuration["SEED_OWNER_PASSWORD"] ?? "ChangeMe123!";
        var pin = configuration["SEED_OWNER_PIN"] ?? "2580";
        var userId = Guid.NewGuid();
        var profileId = Guid.NewGuid();

        await connection.ExecuteAsync("""
            insert into zippyfilms.users (id, name, email, password_hash, pin_hash, role, status)
            values (@Id, @Name, @Email, @PasswordHash, @PinHash, 'OWNER', 'ACTIVE');

            insert into zippyfilms.profiles (id, user_id, name, avatar, is_kids, language, maturity_level)
            values (@ProfileId, @Id, @Name, @Avatar, false, 'pt-BR', 'ALL');
            """, new
        {
            Id = userId,
            ProfileId = profileId,
            Name = name,
            Email = email.ToLowerInvariant(),
            Avatar = name[..1].ToUpperInvariant(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            PinHash = BCrypt.Net.BCrypt.HashPassword(pin)
        });

        logger.LogInformation("Usuario OWNER inicial criado: {Email}", email);
    }
}
