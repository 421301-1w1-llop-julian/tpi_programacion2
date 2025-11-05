using WebApplication1.Models;

namespace WebApplication1.Repositories.Interfaces
{
    public interface IIdiomaRepository
    {
        Task<IEnumerable<Idioma>> GetAllAsync();
        Task<Idioma> GetByIdAsync(int id);
        Task<Idioma> AddAsync(Idioma idioma);
        Task UpdateAsync(Idioma idioma);
        Task DeleteAsync(int id);
        Task<bool> ExistsAsync(int id);
    }
}

