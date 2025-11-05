using WebApplication1.DTOs.GeneroDTO;

namespace WebApplication1.Services.Interfaces
{
    public interface IGeneroService
    {
        Task<IEnumerable<GeneroDTO>> GetAllAsync();
        Task<GeneroDTO> GetByIdAsync(int id);
        Task<GeneroDTO> CreateAsync(GeneroCreateUpdateDTO dto);
        Task<bool> UpdateAsync(int id, GeneroCreateUpdateDTO dto);
        Task<bool> DeleteAsync(int id);
    }
}

