using Microsoft.EntityFrameworkCore;
using WebApplication1.Models;
using WebApplication1.Repositories.Interfaces;

namespace WebApplication1.Repositories
{
    public class IdiomaRepository : IIdiomaRepository
    {
        private readonly CINE_2025_1W1_GRUPO_5Context _context;

        public IdiomaRepository(CINE_2025_1W1_GRUPO_5Context context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Idioma>> GetAllAsync()
        {
            return await _context.Idiomas.ToListAsync();
        }

        public async Task<Idioma> GetByIdAsync(int id)
        {
            return await _context.Idiomas.FindAsync(id);
        }

        public async Task<Idioma> AddAsync(Idioma idioma)
        {
            _context.Idiomas.Add(idioma);
            await _context.SaveChangesAsync();
            return idioma;
        }

        public async Task UpdateAsync(Idioma idioma)
        {
            _context.Entry(idioma).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var entity = await _context.Idiomas.FindAsync(id);
            if (entity != null)
            {
                _context.Idiomas.Remove(entity);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.Idiomas.AnyAsync(e => e.IdIdioma == id);
        }
    }
}

