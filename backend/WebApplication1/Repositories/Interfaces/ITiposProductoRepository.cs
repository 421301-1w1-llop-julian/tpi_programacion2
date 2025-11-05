using WebApplication1.Models;

namespace WebApplication1.Repositories.Interfaces
{
    public interface ITiposProductoRepository
    {
        Task<IEnumerable<TiposProducto>> GetAllAsync();
        Task<TiposProducto> GetByIdAsync(int id);
        Task<TiposProducto> AddAsync(TiposProducto tipoproducto);
        Task UpdateAsync(TiposProducto tipoproducto);
        Task DeleteAsync(int id);
        Task<bool> ExistsAsync(int id);
    }
}
