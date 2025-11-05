using WebApplication1.Models;

namespace WebApplication1.Repositories.Interfaces
{
    public interface IDirectorRepository
    {
        Task<IEnumerable<Director>> GetAllAsync();
        Task<Director> GetByIdAsync(int id);
        Task<Director> AddAsync(Director director);
        Task UpdateAsync(Director director);
        Task DeleteAsync(int id);
        Task<bool> ExistsAsync(int id);
    }
}

