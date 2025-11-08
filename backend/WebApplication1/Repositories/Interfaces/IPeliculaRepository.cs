using WebApplication1.DTOs.Pelicula;
using WebApplication1.DTOs;

namespace WebApplication1.Repositories.Interfaces
{
    public interface IPeliculaRepository
    {
        Task<IEnumerable<PeliculaListDTO>> GetAllAsync();
        Task<PeliculaDTO> GetByIdAsync(int id);
        Task<PeliculaDTO> CreateAsync(PeliculaCreateDTO dto);
        Task<PeliculaDTO> UpdateAsync(PeliculaUpdateDTO dto);
        Task<bool> DeleteAsync(int id);
    }
}
