using Cine2025.DTOs;
using Cine2025.Services;
using Microsoft.AspNetCore.Mvc;

namespace Cine2025.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
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
                var mensaje = await _service.CrearReservaAsync(dto);
                return Ok(new { message = mensaje });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}
