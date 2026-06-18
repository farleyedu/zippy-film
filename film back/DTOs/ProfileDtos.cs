namespace ZippyFilms.Api.DTOs;

public sealed record ProfileResponse(Guid Id, string Name, string Avatar, bool IsKids, string Language, string MaturityLevel);
public sealed record CreateProfileRequest(string Name, string? Avatar, bool IsKids);
public sealed record UpdateProfileRequest(string Name, string? Avatar, bool IsKids, string Language, string MaturityLevel);
public sealed record SelectProfileRequest(Guid ProfileId);
