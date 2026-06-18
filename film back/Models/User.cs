namespace ZippyFilms.Api.Models;

public sealed class User
{
    public Guid Id { get; init; }
    public string Name { get; init; } = "";
    public string Email { get; init; } = "";
    public string PasswordHash { get; init; } = "";
    public string? PinHash { get; init; }
    public string Role { get; init; } = "USER";
    public string Status { get; init; } = "ACTIVE";
}
