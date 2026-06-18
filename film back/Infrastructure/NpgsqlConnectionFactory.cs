using System.Data;
using Npgsql;

namespace ZippyFilms.Api.Infrastructure;

public sealed class NpgsqlConnectionFactory(IConfiguration configuration) : IDbConnectionFactory
{
    public IDbConnection CreateConnection()
    {
        var connectionString = configuration["DATABASE_CONNECTION_STRING"];
        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException("DATABASE_CONNECTION_STRING nao foi configurada.");
        }

        return new NpgsqlConnection(connectionString);
    }
}
