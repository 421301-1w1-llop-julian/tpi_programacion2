using WebApplication1.DTOs.DirectorDTO;

namespace WebApplication1.Services.Interfaces
{
    public interface IDirectorService
    {
        Task<IEnumerable<DirectorDTO>> GetAllAsync();
        Task<DirectorDTO> GetByIdAsync(int id);
        Task<DirectorDTO> CreateAsync(DirectorCreateUpdateDTO dto);
        Task<bool> UpdateAsync(int id, DirectorCreateUpdateDTO dto);
        Task<bool> DeleteAsync(int id);
    }
}

