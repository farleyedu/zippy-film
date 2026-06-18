namespace ZippyFilms.Api.Options;

public sealed class JwtOptions
{
    public string JWT_SECRET { get; init; } = "dev-only-zippyfilms-secret-change-this-value";
    public string JWT_ISSUER { get; init; } = "Zippy";
    public string JWT_AUDIENCE { get; init; } = "ZippyClient";
}
