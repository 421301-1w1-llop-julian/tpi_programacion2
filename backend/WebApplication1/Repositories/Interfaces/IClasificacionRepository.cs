using WebApplication1.Models;

namespace WebApplication1.Repositories.Interfaces
{
    public interface IClasificacionRepository
    {
        Task<List<ClasificacionesPelicula>> GetAllAsync();
        Task<ClasificacionesPelicula?> GetByIdAsync(int id);
        Task<ClasificacionesPelicula> CreateAsync(ClasificacionesPelicula clasificacion);
        Task<bool> UpdateAsync(ClasificacionesPelicula clasificacion);
        Task<bool> DeleteAsync(int id);
        Task<bool> ExistsAsync(int id);
    }
}