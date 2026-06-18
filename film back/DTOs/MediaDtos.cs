namespace ZippyFilms.Api.DTOs;

public sealed record MediaResponse(Guid Id, string Type, string Title, int? Year, string? Overview, string? PosterUrl, string? BackdropUrl, decimal? VoteAverage, string Status);
public sealed record HomeResponse(MediaResponse? Hero, IReadOnlyCollection<MediaRowResponse> Rows);
public sealed record MediaRowResponse(string Title, IReadOnlyCollection<MediaResponse> Items);
public sealed record PlaybackProgressRequest(Guid ProfileId, int CurrentTimeSeconds, int DurationSeconds);
public sealed record ListRequest(Guid ProfileId, Guid MediaId, string ListType);
