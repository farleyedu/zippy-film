using Dapper;

namespace ZippyFilms.Api.Infrastructure;

public sealed class MigrationRunner(IDbConnectionFactory connectionFactory, IWebHostEnvironment environment, ILogger<MigrationRunner> logger)
{
    public async Task RunAsync(CancellationToken cancellationToken = default)
    {
        var migrationsPath = Path.Combine(environment.ContentRootPath, "Migrations");
        if (!Directory.Exists(migrationsPath))
        {
            logger.LogWarning("Pasta de migrations nao encontrada: {Path}", migrationsPath);
            return;
        }

        var files = Directory.GetFiles(migrationsPath, "*.sql").OrderBy(static file => file);

        using var connection = connectionFactory.CreateConnection();
        foreach (var file in files)
        {
            var sql = await File.ReadAllTextAsync(file, cancellationToken);
            logger.LogInformation("Aplicando migration {Migration}", Path.GetFileName(file));
            await connection.ExecuteAsync(sql);
        }
    }
}
