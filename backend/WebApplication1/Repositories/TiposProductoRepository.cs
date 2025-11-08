using Microsoft.EntityFrameworkCore;
using WebApplication1.Models;
using WebApplication1.Repositories.Interfaces;

namespace WebApplication1.Repositories
{
    public class TiposProductoRepository : ITiposProductoRepository
    {
        private readonly CINE_2025_1W1_GRUPO_5Context _context;

        public TiposProductoRepository(CINE_2025_1W1_GRUPO_5Context context)
        {
            _context = context;
        }


        public async Task<TiposProducto> AddAsync(TiposProducto tipoproducto)
        {
            _context.TiposProductos.Add(tipoproducto);
            await _context.SaveChangesAsync();
            return tipoproducto;
        }

        public async Task DeleteAsync(int id)
        {
            var entity = await _context.TiposProductos.FindAsync(id);
            if (entity != null)
            {
                _context.TiposProductos.Remove(entity);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.TiposProductos.AnyAsync(e => e.IdTipoProducto == id);
        }

        public async Task<IEnumerable<TiposProducto>> GetAllAsync()
        {
            return await _context.TiposProductos.ToListAsync();
        }

        public async Task<TiposProducto> GetByIdAsync(int id)
        {
            return await _context.TiposProductos.FindAsync(id);
        }

        public async Task UpdateAsync(TiposProducto tipoproducto)
        {
            _context.Entry(tipoproducto).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }
    }
}
