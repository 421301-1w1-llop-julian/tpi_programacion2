using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApplication1.Models;

namespace WebApplication1.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DistribuidoraController : ControllerBase
    {
        private readonly CINE_2025_1W1_GRUPO_5Context _context;

        public DistribuidoraController(CINE_2025_1W1_GRUPO_5Context context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var distribuidoras = await _context.Distribuidoras
                .Include(d => d.IdPaisNavigation)
                .Select(d => new
                {
                    idDistribuidora = d.IdDistribuidora,
                    nombre = d.Nombre,
                    idPais = d.IdPais,
                    paisNombre = d.IdPaisNavigation != null ? d.IdPaisNavigation.Nombre : string.Empty
                })
                .ToListAsync();
            
            return Ok(distribuidoras);
        }
    }
}

