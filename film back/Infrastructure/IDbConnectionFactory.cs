using System.Data;

namespace ZippyFilms.Api.Infrastructure;

public interface IDbConnectionFactory
{
    IDbConnection CreateConnection();
}
