namespace ZippyFilms.Api.DTOs;

public sealed record LoginRequest(string Email, string Password);
public sealed record RegisterRequest(string Name, string Email, string Password, string? Pin);
public sealed record PinLoginRequest(string Email, string Pin);
public sealed record RefreshRequest(string RefreshToken);
public sealed record AuthUserResponse(Guid Id, string Name, string Email, string Role);
public sealed record AuthResponse(string AccessToken, string RefreshToken, DateTime ExpiresAt, AuthUserResponse User);
