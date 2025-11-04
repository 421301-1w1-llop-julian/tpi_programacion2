using Cine2025.DTOs;
using Cine2025.Services.Interfaces;
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
        private readonly IReservaService _service;

        public ReservasController(IReservaService service)
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
                return StatusCode(403, new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = "Error al crear la reserva. Por favor, verifique los datos. Detalle: " + ex.Message });
            }
        }
    }
}