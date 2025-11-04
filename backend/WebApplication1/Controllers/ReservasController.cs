
using Cine2025.DTOs;
using Cine2025.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using System;
using System.Threading.Tasks;

namespace Cine2025.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ReservasController : ControllerBase
    {
        private readonly ReservaService _service;

        public ReservasController(ReservaService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<IActionResult> CrearReserva([FromBody] CrearReservaDto dto)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int idUsuario))
                {
                    return Unauthorized(new { error = "Token inválido o falta el ID de usuario." });
                }

                var mensaje = await _service.CrearReservaAsync(idUsuario, dto);
                return Ok(new { message = mensaje });
            }
            catch (InvalidOperationException ex)
            {
                // Este error se lanza si el IdUsuario no tiene un IdCliente asociado
                return StatusCode(403, new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}