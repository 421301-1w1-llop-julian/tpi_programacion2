using WebApplication1.Models;

namespace WebApplication1.Repositories.Interfaces
{
    public interface IGeneroRepository
    {
        Task<IEnumerable<Genero>> GetAllAsync();
        Task<Genero> GetByIdAsync(int id);
        Task<Genero> AddAsync(Genero genero);
        Task UpdateAsync(Genero genero);
        Task DeleteAsync(int id);
        Task<bool> ExistsAsync(int id);
    }
}

