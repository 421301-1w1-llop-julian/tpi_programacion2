using Microsoft.EntityFrameworkCore;
using WebApplication1.Models;
using WebApplication1.Repositories.Interfaces;

namespace WebApplication1.Repositories
{
    public class DirectorRepository : IDirectorRepository
    {
        private readonly CINE_2025_1W1_GRUPO_5Context _context;

        public DirectorRepository(CINE_2025_1W1_GRUPO_5Context context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Director>> GetAllAsync()
        {
            return await _context.Directores
                .Include(d => d.IdPaisNavigation)
                .ToListAsync();
        }

        public async Task<Director> GetByIdAsync(int id)
        {
            return await _context.Directores
                .Include(d => d.IdPaisNavigation)
                .FirstOrDefaultAsync(d => d.IdDirector == id);
        }

        public async Task<Director> AddAsync(Director director)
        {
            _context.Directores.Add(director);
            await _context.SaveChangesAsync();
            return director;
        }

        public async Task UpdateAsync(Director director)
        {
            _context.Entry(director).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var entity = await _context.Directores.FindAsync(id);
            if (entity != null)
            {
                _context.Directores.Remove(entity);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.Directores.AnyAsync(e => e.IdDirector == id);
        }
    }
}

