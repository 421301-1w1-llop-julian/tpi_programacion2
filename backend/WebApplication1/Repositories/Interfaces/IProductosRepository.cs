using WebApplication1.Models;

namespace WebApplication1.Repositories.Interfaces
{
    public interface IProductosRepository
    {
        Task<IEnumerable<Producto>> GetAllAsync();
        Task<Producto> GetByIdAsync(int id);
        Task<Producto> AddAsync(Producto nombre);
        Task UpdateAsync(Producto nombre);
        Task DeleteAsync(int id);
        Task<bool> ExistsAsync(int id);
    }
}
