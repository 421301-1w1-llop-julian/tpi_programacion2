using WebApplication1.DTOs.Funcion;

namespace WebApplication1.Services.Interfaces
{
    public interface IFuncionService
    {
        Task<IEnumerable<FuncionListDTO>> GetAllAsync();
        Task<FuncionDTO> GetByIdAsync(int id);
        Task<FuncionDTO> CreateAsync(FuncionCreateDTO dto);
        Task<FuncionDTO> UpdateAsync(FuncionUpdateDTO dto);
        Task<bool> DeleteAsync(int id);
    }
}

