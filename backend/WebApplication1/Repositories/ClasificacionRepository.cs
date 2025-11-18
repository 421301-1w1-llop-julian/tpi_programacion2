using Microsoft.EntityFrameworkCore;
using WebApplication1.Models;
using WebApplication1.Repositories.Interfaces;

namespace WebApplication1.Repositories
{
    public class ClasificacionRepository : IClasificacionRepository
    {
        private readonly CINE_2025_1W1_GRUPO_5Context _context;

        public ClasificacionRepository(CINE_2025_1W1_GRUPO_5Context context)
        {
            _context = context;
        }

        public async Task<List<ClasificacionesPelicula>> GetAllAsync()
        {
            return await _context.ClasificacionesPeliculas.ToListAsync();
        }

        public async Task<ClasificacionesPelicula?> GetByIdAsync(int id)
        {
            return await _context.ClasificacionesPeliculas.FindAsync(id);
        }

        public async Task<ClasificacionesPelicula> CreateAsync(ClasificacionesPelicula clasificacion)
        {
            _context.ClasificacionesPeliculas.Add(clasificacion);
            await _context.SaveChangesAsync();
            return clasificacion;
        }

        public async Task<bool> UpdateAsync(ClasificacionesPelicula clasificacion)
        {
            _context.Entry(clasificacion).State = EntityState.Modified;
            try
            {
                await _context.SaveChangesAsync();
                return true;
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await ExistsAsync(clasificacion.IdClasificacion))
                {
                    return false;
                }
                throw;
            }
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var clasificacion = await _context.ClasificacionesPeliculas.FindAsync(id);
            if (clasificacion == null)
            {
                return false;
            }

            _context.ClasificacionesPeliculas.Remove(clasificacion);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.ClasificacionesPeliculas.AnyAsync(e => e.IdClasificacion == id);
        }
    }
}