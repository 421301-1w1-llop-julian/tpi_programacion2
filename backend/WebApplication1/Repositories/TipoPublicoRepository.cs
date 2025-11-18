using Microsoft.EntityFrameworkCore;
using WebApplication1.Models;
using WebApplication1.Repositories.Interfaces;

namespace WebApplication1.Repositories
{
    public class TipoPublicoRepository : ITipoPublicoRepository
    {
        private readonly CINE_2025_1W1_GRUPO_5Context _context;

        public TipoPublicoRepository(CINE_2025_1W1_GRUPO_5Context context)
        {
            _context = context;
        }

        public async Task<List<TiposPublico>> GetAllAsync()
        {
            return await _context.TiposPublicos.ToListAsync();
        }

        public async Task<TiposPublico?> GetByIdAsync(int id)
        {
            return await _context.TiposPublicos.FindAsync(id);
        }

        public async Task<TiposPublico> CreateAsync(TiposPublico tipoPublico)
        {
            _context.TiposPublicos.Add(tipoPublico);
            await _context.SaveChangesAsync();
            return tipoPublico;
        }

        public async Task<bool> UpdateAsync(TiposPublico tipoPublico)
        {
            _context.Entry(tipoPublico).State = EntityState.Modified;
            try
            {
                await _context.SaveChangesAsync();
                return true;
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await ExistsAsync(tipoPublico.IdTipoPublico))
                {
                    return false;
                }
                throw;
            }
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var tipoPublico = await _context.TiposPublicos.FindAsync(id);
            if (tipoPublico == null)
            {
                return false;
            }

            _context.TiposPublicos.Remove(tipoPublico);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.TiposPublicos.AnyAsync(e => e.IdTipoPublico == id);
        }
    }
}