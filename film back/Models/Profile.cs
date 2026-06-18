namespace ZippyFilms.Api.Models;

public sealed class Profile
{
    public Guid Id { get; init; }
    public Guid UserId { get; init; }
    public string Name { get; init; } = "";
    public string Avatar { get; init; } = "";
    public bool IsKids { get; init; }
    public string Language { get; init; } = "pt-BR";
    public string MaturityLevel { get; init; } = "ALL";
}
