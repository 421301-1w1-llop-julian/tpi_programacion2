using Cine2025.DTOs;
using Cine2025.Services;
using Microsoft.AspNetCore.Mvc;

namespace Cine2025.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsuariosController : ControllerBase
    {
        private readonly UsuarioService _service;

        public UsuariosController(UsuarioService service)
        {
            _service = service;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Registrar([FromBody] UsuarioRegistroDto dto)
        {
            try
            {
                var result = await _service.RegistrarAsync(dto);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] UsuarioLoginDto dto)
        {
            var result = await _service.LoginAsync(dto);
            if (result == null)
                return Unauthorized(new { message = "Usuario o contraseña incorrectos" });

            return Ok(result);
        }
    }
}
