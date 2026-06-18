using Microsoft.AspNetCore.Mvc;
using ZippyFilms.Api.DTOs;
using ZippyFilms.Api.Services;

namespace ZippyFilms.Api.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController(AuthService authService) : ControllerBase
{
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
    {
        var response = await authService.LoginAsync(request);
        return response is null ? Unauthorized(new { message = "Email ou senha invalidos." }) : Ok(response);
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
    {
        var response = await authService.RegisterAsync(request);
        return Created("/api/auth/me", response);
    }

    [HttpPost("pin-login")]
    public async Task<ActionResult<AuthResponse>> PinLogin(PinLoginRequest request)
    {
        var response = await authService.PinLoginAsync(request);
        return response is null ? Unauthorized(new { message = "Email ou PIN invalidos." }) : Ok(response);
    }

    [HttpPost("refresh")]
    public ActionResult Refresh(RefreshRequest request)
    {
        return Accepted(new { message = "Refresh token preparado para persistencia em user_sessions.", request.RefreshToken });
    }

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        return NoContent();
    }
}
