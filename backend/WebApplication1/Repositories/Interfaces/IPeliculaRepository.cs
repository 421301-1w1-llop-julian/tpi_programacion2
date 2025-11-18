using WebApplication1.DTOs.Pelicula;

namespace WebApplication1.Repositories.Interfaces
{
    public interface IPeliculaRepository
    {
        Task<IEnumerable<PeliculaListDTO>> GetAllAsync(PeliculaFilterDTO? filters = null);
        Task<PeliculaDTO> GetByIdAsync(int id);
        Task<PeliculaDTO> CreateAsync(PeliculaCreateDTO dto);
        Task<PeliculaDTO> UpdateAsync(PeliculaUpdateDTO dto);
        Task<bool> DeleteAsync(int id);
    }
}
