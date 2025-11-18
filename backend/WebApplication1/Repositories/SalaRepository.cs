using Microsoft.EntityFrameworkCore;
using WebApplication1.Models;
using WebApplication1.Repositories.Interfaces;

namespace WebApplication1.Repositories
{
    public class SalaRepository : ISalaRepository
    {
        private readonly CINE_2025_1W1_GRUPO_5Context _context;

        public SalaRepository(CINE_2025_1W1_GRUPO_5Context context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Sala>> GetAllAsync()
        {
            return await _context.Salas
                .Include(s => s.IdCineNavigation)
                .Include(s => s.IdTipoSalaNavigation)
                .ToListAsync();
        }

        public async Task<Sala?> GetByIdAsync(int id)
        {
            return await _context.Salas
                .Include(s => s.IdCineNavigation)
                .Include(s => s.IdTipoSalaNavigation)
                .FirstOrDefaultAsync(s => s.IdSala == id);
        }

        public async Task<Sala> AddAsync(Sala sala)
        {
            _context.Salas.Add(sala);
            await _context.SaveChangesAsync();
            return sala;
        }

        public async Task UpdateAsync(Sala sala)
        {
            _context.Entry(sala).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var entity = await _context.Salas.FindAsync(id);
            if (entity != null)
            {
                _context.Salas.Remove(entity);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.Salas.AnyAsync(s => s.IdSala == id);
        }
    }
}

