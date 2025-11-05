using Microsoft.AspNetCore.Mvc;
using WebApplication1.DTOs.IdiomaDTO;
using WebApplication1.Services.Interfaces;

namespace WebApplication1.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class IdiomaController : ControllerBase
    {
        private readonly IIdiomaService _service;

        public IdiomaController(IIdiomaService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var idiomas = await _service.GetAllAsync();
            return Ok(idiomas);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var idioma = await _service.GetByIdAsync(id);
            if (idioma == null)
                return NotFound(new { message = $"No se encontró el idioma con ID {id}" });

            return Ok(idioma);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] IdiomaCreateUpdateDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var created = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.IdIdioma }, created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] IdiomaCreateUpdateDTO dto)
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

