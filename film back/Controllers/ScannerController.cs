using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ZippyFilms.Api.Services;

namespace ZippyFilms.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/scanner")]
public sealed class ScannerController(ScannerService scannerService) : ControllerBase
{
    [HttpPost("run")]
    public async Task<IActionResult> Run(CancellationToken cancellationToken)
    {
        await scannerService.RunAsync(cancellationToken);
        return Accepted(new { message = "Scanner iniciado." });
    }

    [HttpGet("events")]
    public IActionResult Events() => Ok(Array.Empty<object>());

    [HttpGet("sources")]
    public IActionResult Sources() => Ok(Array.Empty<object>());
}
