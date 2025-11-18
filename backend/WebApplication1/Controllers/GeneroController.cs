using Microsoft.AspNetCore.Mvc;
using WebApplication1.DTOs.GeneroDTO;
using WebApplication1.Services.Interfaces;

namespace WebApplication1.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GeneroController : ControllerBase
    {
        private readonly IGeneroService _service;

        public GeneroController(IGeneroService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var generos = await _service.GetAllAsync();
            return Ok(generos);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var genero = await _service.GetByIdAsync(id);
            if (genero == null)
                return NotFound(new { message = $"No se encontró el género con ID {id}" });

            return Ok(genero);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] GeneroCreateUpdateDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var created = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.IdGenero }, created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] GeneroCreateUpdateDTO dto)
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

