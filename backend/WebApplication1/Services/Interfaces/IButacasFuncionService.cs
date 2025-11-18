using WebApplication1.DTOs.ButacasFuncion;

namespace WebApplication1.Services.Interfaces
{
    public interface IButacasFuncionService
    {
        Task<IEnumerable<ButacasFuncionDTO>> GetAllAsync(int? funcionId = null);
        Task<ButacasFuncionDTO?> GetByIdAsync(int id);
        Task<ButacasFuncionDTO> CreateAsync(ButacasFuncionCreateDTO dto);
        Task<ButacasFuncionDTO?> UpdateAsync(ButacasFuncionUpdateDTO dto);
        Task<bool> DeleteAsync(int id);
    }
}

