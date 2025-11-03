
using Cine2025.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using WebApplication1.Models;

namespace Cine2025.Repositories
{
    public class UsuarioRepository : IUsuarioRepository
    {
        private readonly CINE_2025_1W1_GRUPO_5Context _context;

        public UsuarioRepository(CINE_2025_1W1_GRUPO_5Context context)
        {
            _context = context;
        }

        public async Task<Usuario?> GetByUsernameAsync(string username)
        {
            return await _context.Usuarios
                .Include(u => u.IdTipoUsuarioNavigation)
                .FirstOrDefaultAsync(u => u.Username == username && u.Activo == true);
        }

        public async Task<Usuario?> GetByIdAsync(int id)
        {
            return await _context.Usuarios
                .Include(u => u.IdTipoUsuarioNavigation)
                .FirstOrDefaultAsync(u => u.IdUsuario == id);
        }

        public async Task AddAsync(Usuario usuario)
        {
            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();
        }
    }
}
