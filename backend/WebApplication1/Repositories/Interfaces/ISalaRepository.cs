using WebApplication1.Models;

namespace WebApplication1.Repositories.Interfaces
{
    public interface ISalaRepository
    {
        Task<IEnumerable<Sala>> GetAllAsync();
        Task<Sala?> GetByIdAsync(int id);
        Task<Sala> AddAsync(Sala sala);
        Task UpdateAsync(Sala sala);
        Task DeleteAsync(int id);
        Task<bool> ExistsAsync(int id);
    }
}

