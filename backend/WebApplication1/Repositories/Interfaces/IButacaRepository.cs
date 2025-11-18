using WebApplication1.DTOs.Butaca;

namespace WebApplication1.Repositories.Interfaces
{
    public interface IButacaRepository
    {
        Task<IEnumerable<ButacaDTO>> GetAllAsync(int? salaId = null);
        Task<ButacaDTO?> GetByIdAsync(int id);
        Task<ButacaDTO> CreateAsync(ButacaCreateDTO dto);
        Task<ButacaDTO?> UpdateAsync(ButacaUpdateDTO dto);
        Task<bool> DeleteAsync(int id);
    }
}

