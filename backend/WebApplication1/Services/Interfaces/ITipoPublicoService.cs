using WebApplication1.DTOs.TipoPublicoDTO;

namespace WebApplication1.Services.Interfaces
{
    public interface ITipoPublicoService
    {
        Task<List<TipoPublicoResponseDTO>> GetAllAsync();
        Task<TipoPublicoResponseDTO?> GetByIdAsync(int id);
        Task<TipoPublicoResponseDTO> CreateAsync(TipoPublicoCreateDTO dto);
        Task<bool> UpdateAsync(int id, TipoPublicoCreateDTO dto);
        Task<bool> DeleteAsync(int id);
    }
}