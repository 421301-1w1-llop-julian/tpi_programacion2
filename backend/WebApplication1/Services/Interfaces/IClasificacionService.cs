using WebApplication1.DTOs.ClasificacionDTO;

namespace WebApplication1.Services.Interfaces
{
    public interface IClasificacionService
    {
        Task<List<ClasificacionResponseDTO>> GetAllAsync();
        Task<ClasificacionResponseDTO?> GetByIdAsync(int id);
        Task<ClasificacionResponseDTO> CreateAsync(ClasificacionCreateDTO dto);
        Task<bool> UpdateAsync(int id, ClasificacionCreateDTO dto);
        Task<bool> DeleteAsync(int id);
    }
}