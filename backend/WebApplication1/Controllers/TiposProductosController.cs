using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using WebApplication1.DTOs.TiposProductoDTO;
using WebApplication1.DTOs.TiposUsuariosDTO;
using WebApplication1.Services.Interfaces;

namespace WebApplication1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TiposProductosController : ControllerBase
    {
        private readonly ITiposProductoService _service;

        public TiposProductosController(ITiposProductoService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var tipos = await _service.GetAllAsync();
            return Ok(tipos);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var tipo = await _service.GetByIdAsync(id);
            if (tipo == null)
                return NotFound(new { message = $"No se encontró el tipo de producto con ID {id}" });

            return Ok(tipo);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] TiposProductoCreateUpdateDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var created = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.IdTipoProducto }, created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] TiposProductoCreateUpdateDTO dto)
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
