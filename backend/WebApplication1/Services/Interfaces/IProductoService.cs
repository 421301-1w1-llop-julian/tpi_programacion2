using WebApplication1.DTOs.Producto;
using WebApplication1.DTOs.TiposUsuariosDTO;

namespace WebApplication1.Services.Interfaces
{
    public interface IProductoService
    {
        Task<IEnumerable<ProductoDTO>> GetAllAsync();
        Task<ProductoDTO> GetByIdAsync(int id);
        Task<ProductoDTO> CreateAsync(ProductoCreateUpdateDTO dto);
        Task<bool> UpdateAsync(int id, ProductoCreateUpdateDTO dto);
        Task<bool> DeleteAsync(int id);
    }
}
