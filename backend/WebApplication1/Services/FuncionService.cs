using WebApplication1.DTOs.Funcion;
using WebApplication1.Repositories.Interfaces;
using WebApplication1.Services.Interfaces;

namespace WebApplication1.Services
{
    public class FuncionService : IFuncionService
    {
        private readonly IFuncionRepository _repository;

        public FuncionService(IFuncionRepository repository)
        {
            _repository = repository;
        }

        public Task<IEnumerable<FuncionListDTO>> GetAllAsync(int? peliculaId = null) => _repository.GetAllAsync(peliculaId);
        public Task<FuncionDTO> GetByIdAsync(int id) => _repository.GetByIdAsync(id);
        public Task<FuncionDTO> CreateAsync(FuncionCreateDTO dto) => _repository.CreateAsync(dto);
        public Task<FuncionDTO> UpdateAsync(FuncionUpdateDTO dto) => _repository.UpdateAsync(dto);
        public Task<bool> DeleteAsync(int id) => _repository.DeleteAsync(id);
    }
}

