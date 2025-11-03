using WebApplication1.DTOs.TiposUsuariosDTO;
using WebApplication1.Models;

namespace WebApplication1.Services.Interfaces
{
    public interface ITiposUsuarioService
    {
        Task<IEnumerable<TiposUsuarioDTO>> GetAllAsync();
        Task<TiposUsuarioDTO> GetByIdAsync(int id);
        Task<TiposUsuarioDTO> CreateAsync(TiposUsuarioCreateUpdateDTO dto);
        Task<bool> UpdateAsync(int id, TiposUsuarioCreateUpdateDTO dto);
        Task<bool> DeleteAsync(int id);
    }
}
