namespace ZippyFilms.Api.Options;

public sealed class TmdbOptions
{
    public string? TMDB_API_KEY { get; init; }
    public string TMDB_LANGUAGE { get; init; } = "pt-BR";
}
