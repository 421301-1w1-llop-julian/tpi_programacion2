using Microsoft.AspNetCore.Mvc;
using WebApplication1.DTOs.ClasificacionDTO;
using WebApplication1.Services.Interfaces;

namespace WebApplication1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ClasificacionesController : ControllerBase
    {
        private readonly IClasificacionService _service;

        public ClasificacionesController(IClasificacionService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var clasificaciones = await _service.GetAllAsync();
            return Ok(clasificaciones);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var clasificacion = await _service.GetByIdAsync(id);
            if (clasificacion == null)
                return NotFound(new { message = $"No se encontró la clasificación con ID {id}" });

            return Ok(clasificacion);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ClasificacionCreateDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var created = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.IdClasificacion }, created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] ClasificacionCreateDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var updated = await _service.UpdateAsync(id, dto);
            if (!updated)
                return NotFound(new { message = $"No se pudo actualizar. ID {id} no existe." });

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _service.DeleteAsync(id);
            if (!deleted)
                return NotFound(new { message = $"No se pudo eliminar. ID {id} no existe." });

            return NoContent();
        }
    }
}