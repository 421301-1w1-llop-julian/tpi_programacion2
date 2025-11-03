// Controllers/AuthController.cs
using Cine2025.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using WebApplication1.DTOs.Usuario;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IUsuarioService _userService;
    public AuthController(IUsuarioService userService)
    {
        _userService = userService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] UserCreateDTO dto)
    {
        try
        {
            var user = await _userService.CreateAsync(dto);
            return CreatedAtAction(nameof(Register), new { id = user.IdUsuario }, user);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] AuthRequestDTO dto)
    {
        var auth = await _userService.AuthenticateAsync(dto);
        if (auth == null) return Unauthorized(new { message = "Credenciales inválidas" });

        return Ok(auth);
    }
}
