namespace ZippyFilms.Api.Models;

public sealed class MediaSummary
{
    public Guid Id { get; init; }
    public string Type { get; init; } = "MOVIE";
    public string Title { get; init; } = "";
    public int? Year { get; init; }
    public string? Overview { get; init; }
    public string? PosterUrl { get; init; }
    public string? BackdropUrl { get; init; }
    public decimal? VoteAverage { get; init; }
    public string Status { get; init; } = "AVAILABLE";
}
