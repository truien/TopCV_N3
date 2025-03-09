using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

[Route("api/auth")]
[ApiController]
public class AuthController : ControllerBase
{
    [HttpGet("login-google")]
    public IActionResult LoginWithGoogle()
    {
        var redirectUrl = Url.Action(nameof(GoogleResponse), "Auth");
        var properties = new AuthenticationProperties { RedirectUri = redirectUrl };
        return Challenge(properties, GoogleDefaults.AuthenticationScheme);
    }

    [HttpGet("google-response")]
    public async Task<IActionResult> GoogleResponse()
    {
        var authenticateResult = await HttpContext.AuthenticateAsync();

        if (!authenticateResult.Succeeded)
            return BadRequest("Google login failed.");

        var claims = authenticateResult.Principal.Identities
            .FirstOrDefault()?.Claims.Select(c => new { c.Type, c.Value });

        return Ok(claims);
    }
}
