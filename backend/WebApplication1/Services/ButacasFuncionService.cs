using WebApplication1.DTOs.ButacasFuncion;
using WebApplication1.Repositories.Interfaces;
using WebApplication1.Services.Interfaces;

namespace WebApplication1.Services
{
    public class ButacasFuncionService : IButacasFuncionService
    {
        private readonly IButacasFuncionRepository _repository;

        public ButacasFuncionService(IButacasFuncionRepository repository)
        {
            _repository = repository;
        }

        public Task<IEnumerable<ButacasFuncionDTO>> GetAllAsync(int? funcionId = null) => _repository.GetAllAsync(funcionId);

        public Task<ButacasFuncionDTO?> GetByIdAsync(int id) => _repository.GetByIdAsync(id);

        public Task<ButacasFuncionDTO> CreateAsync(ButacasFuncionCreateDTO dto) => _repository.CreateAsync(dto);

        public Task<ButacasFuncionDTO?> UpdateAsync(ButacasFuncionUpdateDTO dto) => _repository.UpdateAsync(dto);

        public Task<bool> DeleteAsync(int id) => _repository.DeleteAsync(id);
    }
}

