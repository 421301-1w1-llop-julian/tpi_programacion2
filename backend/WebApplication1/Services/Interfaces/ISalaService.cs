using WebApplication1.DTOs.Sala;

namespace WebApplication1.Services.Interfaces
{
    public interface ISalaService
    {
        Task<IEnumerable<SalaDTO>> GetAllAsync();
        Task<SalaDTO?> GetByIdAsync(int id);
        Task<SalaDTO> CreateAsync(SalaCreateUpdateDTO dto);
        Task<bool> UpdateAsync(int id, SalaCreateUpdateDTO dto);
        Task<bool> DeleteAsync(int id);
    }
}

