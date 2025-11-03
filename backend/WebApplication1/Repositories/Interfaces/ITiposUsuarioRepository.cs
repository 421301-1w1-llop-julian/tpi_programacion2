using WebApplication1.Models;

namespace WebApplication1.Repositories.Interfaces
{
    public interface ITiposUsuarioRepository
    {
        Task<IEnumerable<TiposUsuario>> GetAllAsync();
        Task<TiposUsuario> GetByIdAsync(int id);
        Task<TiposUsuario> AddAsync(TiposUsuario tipoUsuario);
        Task UpdateAsync(TiposUsuario tipoUsuario);
        Task DeleteAsync(int id);
        Task<bool> ExistsAsync(int id);
    }
}
