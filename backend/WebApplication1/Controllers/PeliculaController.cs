using Microsoft.AspNetCore.Mvc;
using WebApplication1.DTOs.Pelicula;
using WebApplication1.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;

namespace WebApplication1.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PeliculaController : ControllerBase
    {
        private readonly IPeliculaService _service;

        public PeliculaController(IPeliculaService service)
        {
            _service = service;
        }

        // ---- PÚBLICOS ----
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] PeliculaFilterDTO? filters)
        {
            Console.WriteLine(filters);
            var peliculas = await _service.GetAllAsync(filters);
            return Ok(peliculas);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var pelicula = await _service.GetByIdAsync(id);
            if (pelicula == null) return NotFound();
            return Ok(pelicula);
        }

        // ---- SOLO ADMIN ----
        [Authorize(Policy = "AdminOnly")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] PeliculaCreateDTO dto)
        {
            var nueva = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = nueva.IdPelicula }, nueva);
        }

        [Authorize(Policy = "AdminOnly")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] PeliculaUpdateDTO dto)
        {
            if (id != dto.IdPelicula) return BadRequest("ID de película no coincide");
            var actualizada = await _service.UpdateAsync(dto);
            if (actualizada == null) return NotFound();
            return Ok(actualizada);
        }

        [Authorize(Policy = "AdminOnly")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var eliminado = await _service.DeleteAsync(id);
            return eliminado ? NoContent() : NotFound();
        }
    }
}
