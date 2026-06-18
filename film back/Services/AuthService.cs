using ZippyFilms.Api.DTOs;
using ZippyFilms.Api.Repositories;

namespace ZippyFilms.Api.Services;

public sealed class AuthService(IAuthRepository authRepository, TokenService tokenService)
{
    public async Task<AuthResponse?> LoginAsync(LoginRequest request)
    {
        var user = await authRepository.GetByEmailAsync(request.Email);
        if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            return null;
        }

        await authRepository.TouchLoginAsync(user.Id);
        var tokens = tokenService.CreateTokens(user);
        return new AuthResponse(tokens.AccessToken, tokens.RefreshToken, tokens.ExpiresAt, new AuthUserResponse(user.Id, user.Name, user.Email, user.Role));
    }

    public async Task<AuthResponse?> PinLoginAsync(PinLoginRequest request)
    {
        var user = await authRepository.GetByEmailAsync(request.Email);
        if (user is null || user.PinHash is null || !BCrypt.Net.BCrypt.Verify(request.Pin, user.PinHash))
        {
            return null;
        }

        await authRepository.TouchLoginAsync(user.Id);
        var tokens = tokenService.CreateTokens(user);
        return new AuthResponse(tokens.AccessToken, tokens.RefreshToken, tokens.ExpiresAt, new AuthUserResponse(user.Id, user.Name, user.Email, user.Role));
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
        var pinHash = string.IsNullOrWhiteSpace(request.Pin) ? null : BCrypt.Net.BCrypt.HashPassword(request.Pin);
        var user = await authRepository.CreateAsync(request.Name, request.Email, passwordHash, pinHash);
        var tokens = tokenService.CreateTokens(user);
        return new AuthResponse(tokens.AccessToken, tokens.RefreshToken, tokens.ExpiresAt, new AuthUserResponse(user.Id, user.Name, user.Email, user.Role));
    }
}
