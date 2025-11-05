using WebApplication1.DTOs.TiposProductoDTO;
using WebApplication1.DTOs.TiposUsuariosDTO;

namespace WebApplication1.Services.Interfaces
{
    public interface ITiposProductoService
    {
        Task<IEnumerable<TiposProductoDTO>> GetAllAsync();
        Task<TiposProductoDTO> GetByIdAsync(int id);
        Task<TiposProductoDTO> CreateAsync(TiposProductoCreateUpdateDTO dto);
        Task<bool> UpdateAsync(int id, TiposProductoCreateUpdateDTO dto);
        Task<bool> DeleteAsync(int id);
    }
}
