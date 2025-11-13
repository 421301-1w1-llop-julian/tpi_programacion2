using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApplication1.DTOs.Funcion;
using WebApplication1.Services.Interfaces;

namespace WebApplication1.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FuncionController : ControllerBase
    {
        private readonly IFuncionService _service;

        public FuncionController(IFuncionService service)
        {
            _service = service;
        }

        // ---- PÚBLICOS ----
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] int? peliculaId = null)
        {
            var funciones = await _service.GetAllAsync(peliculaId);
            return Ok(funciones);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var funcion = await _service.GetByIdAsync(id);
            if (funcion == null) return NotFound();
            return Ok(funcion);
        }

        // ---- SOLO ADMIN ----
        [Authorize(Policy = "AdminOnly")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] FuncionCreateDTO dto)
        {
            try
            {
                var nueva = await _service.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = nueva.IdFuncion }, nueva);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Error al crear la función", details = ex.Message });
            }
        }

        [Authorize(Policy = "AdminOnly")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] FuncionUpdateDTO dto)
        {
            if (id != dto.IdFuncion) 
                return BadRequest(new { error = "ID de función no coincide" });

            try
            {
                var actualizada = await _service.UpdateAsync(dto);
                if (actualizada == null) return NotFound();
                return Ok(actualizada);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Error al actualizar la función", details = ex.Message });
            }
        }

        [Authorize(Policy = "AdminOnly")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var eliminado = await _service.DeleteAsync(id);
                return eliminado ? NoContent() : NotFound();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Error al eliminar la función", details = ex.Message });
            }
        }
    }
}

