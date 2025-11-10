using WebApplication1.Models;

namespace WebApplication1.Repositories.Interfaces
{
    public interface ITipoPublicoRepository
    {
        Task<List<TiposPublico>> GetAllAsync();
        Task<TiposPublico?> GetByIdAsync(int id);
        Task<TiposPublico> CreateAsync(TiposPublico tipoPublico);
        Task<bool> UpdateAsync(TiposPublico tipoPublico);
        Task<bool> DeleteAsync(int id);
        Task<bool> ExistsAsync(int id);
    }
}