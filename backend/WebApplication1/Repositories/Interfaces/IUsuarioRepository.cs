using WebApplication1.Models;

namespace Cine2025.Repositories.Interfaces
{
    public interface IUsuariosRepository
    {
        Task<Usuario?> GetByUsernameAsync(string username);
        Task<Usuario?> GetByIdAsync(int id);
        Task AddAsync(Usuario usuario);
    }
}
