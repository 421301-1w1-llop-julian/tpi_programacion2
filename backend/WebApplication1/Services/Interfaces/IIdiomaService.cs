using WebApplication1.DTOs.IdiomaDTO;

namespace WebApplication1.Services.Interfaces
{
    public interface IIdiomaService
    {
        Task<IEnumerable<IdiomaDTO>> GetAllAsync();
        Task<IdiomaDTO> GetByIdAsync(int id);
        Task<IdiomaDTO> CreateAsync(IdiomaCreateUpdateDTO dto);
        Task<bool> UpdateAsync(int id, IdiomaCreateUpdateDTO dto);
        Task<bool> DeleteAsync(int id);
    }
}

