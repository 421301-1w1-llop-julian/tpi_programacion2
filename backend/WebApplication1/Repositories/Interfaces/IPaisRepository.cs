using WebApplication1.Models;

namespace WebApplication1.Repositories.Interfaces
{
    public interface IPaisRepository
    {
        Task<IEnumerable<Pais>> GetAllAsync();
        Task<Pais> GetByIdAsync(int id);
        Task<Pais> AddAsync(Pais pais);
        Task UpdateAsync(Pais pais);
        Task DeleteAsync(int id);
        Task<bool> ExistsAsync(int id);
    }
}

