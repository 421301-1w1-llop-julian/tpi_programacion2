using Microsoft.EntityFrameworkCore;
using WebApplication1.Models;
using WebApplication1.Repositories.Interfaces;

namespace WebApplication1.Repositories
{
    public class PaisRepository : IPaisRepository
    {
        private readonly CINE_2025_1W1_GRUPO_5Context _context;

        public PaisRepository(CINE_2025_1W1_GRUPO_5Context context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Pais>> GetAllAsync()
        {
            return await _context.Paises.ToListAsync();
        }

        public async Task<Pais> GetByIdAsync(int id)
        {
            return await _context.Paises.FindAsync(id);
        }

        public async Task<Pais> AddAsync(Pais pais)
        {
            _context.Paises.Add(pais);
            await _context.SaveChangesAsync();
            return pais;
        }

        public async Task UpdateAsync(Pais pais)
        {
            _context.Entry(pais).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var entity = await _context.Paises.FindAsync(id);
            if (entity != null)
            {
                _context.Paises.Remove(entity);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.Paises.AnyAsync(e => e.IdPais == id);
        }
    }
}

