using WebApplication1.DTOs.Funcion;

namespace WebApplication1.Repositories.Interfaces
{
    public interface IFuncionRepository
    {
        Task<IEnumerable<FuncionListDTO>> GetAllAsync(int? peliculaId = null);
        Task<FuncionDTO> GetByIdAsync(int id);
        Task<FuncionDTO> CreateAsync(FuncionCreateDTO dto);
        Task<FuncionDTO> UpdateAsync(FuncionUpdateDTO dto);
        Task<bool> DeleteAsync(int id);
    }
}

