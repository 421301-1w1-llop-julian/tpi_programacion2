using Microsoft.AspNetCore.Mvc;
using WebApplication1.DTOs.TipoPublicoDTO;
using WebApplication1.Services.Interfaces;

namespace WebApplication1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TiposPublicoController : ControllerBase
    {
        private readonly ITipoPublicoService _service;

        public TiposPublicoController(ITipoPublicoService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var tiposPublico = await _service.GetAllAsync();
            return Ok(tiposPublico);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var tipoPublico = await _service.GetByIdAsync(id);
            if (tipoPublico == null)
                return NotFound(new { message = $"No se encontró el tipo de público con ID {id}" });

            return Ok(tipoPublico);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] TipoPublicoCreateDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var created = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.IdTipoPublico }, created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] TipoPublicoCreateDTO dto)
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