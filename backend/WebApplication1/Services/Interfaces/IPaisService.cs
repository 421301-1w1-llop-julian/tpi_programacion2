using WebApplication1.DTOs.PaisDTO;

namespace WebApplication1.Services.Interfaces
{
    public interface IPaisService
    {
        Task<IEnumerable<PaisDTO>> GetAllAsync();
        Task<PaisDTO> GetByIdAsync(int id);
        Task<PaisDTO> CreateAsync(PaisCreateUpdateDTO dto);
        Task<bool> UpdateAsync(int id, PaisCreateUpdateDTO dto);
        Task<bool> DeleteAsync(int id);
    }
}

