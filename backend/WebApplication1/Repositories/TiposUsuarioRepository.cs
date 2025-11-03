using Microsoft.EntityFrameworkCore;
using WebApplication1.Models;
using WebApplication1.Repositories.Interfaces;

namespace WebApplication1.Repositories
{
    public class TiposUsuarioRepository : ITiposUsuarioRepository
    {
        private readonly CINE_2025_1W1_GRUPO_5Context _context;

        public TiposUsuarioRepository(CINE_2025_1W1_GRUPO_5Context context)
        {
            _context = context;
        }

        public async Task<IEnumerable<TiposUsuario>> GetAllAsync()
        {
            return await _context.TiposUsuarios.ToListAsync();
        }

        public async Task<TiposUsuario> GetByIdAsync(int id)
        {
            return await _context.TiposUsuarios.FindAsync(id);
        }

        public async Task<TiposUsuario> AddAsync(TiposUsuario tipoUsuario)
        {
            _context.TiposUsuarios.Add(tipoUsuario);
            await _context.SaveChangesAsync();
            return tipoUsuario;
        }

        public async Task UpdateAsync(TiposUsuario tipoUsuario)
        {
            _context.Entry(tipoUsuario).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var entity = await _context.TiposUsuarios.FindAsync(id);
            if (entity != null)
            {
                _context.TiposUsuarios.Remove(entity);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.TiposUsuarios.AnyAsync(e => e.IdTipoUsuario == id);
        }
    }
}
