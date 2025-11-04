using Microsoft.EntityFrameworkCore;
using WebApplication1.Models;
using WebApplication1.Repositories.Interfaces;

namespace WebApplication1.Repositories
{
    public class GeneroRepository : IGeneroRepository
    {
        private readonly CINE_2025_1W1_GRUPO_5Context _context;

        public GeneroRepository(CINE_2025_1W1_GRUPO_5Context context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Genero>> GetAllAsync()
        {
            return await _context.Generos.ToListAsync();
        }

        public async Task<Genero> GetByIdAsync(int id)
        {
            return await _context.Generos.FindAsync(id);
        }

        public async Task<Genero> AddAsync(Genero genero)
        {
            _context.Generos.Add(genero);
            await _context.SaveChangesAsync();
            return genero;
        }

        public async Task UpdateAsync(Genero genero)
        {
            _context.Entry(genero).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var entity = await _context.Generos.FindAsync(id);
            if (entity != null)
            {
                _context.Generos.Remove(entity);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.Generos.AnyAsync(e => e.IdGenero == id);
        }
    }
}

