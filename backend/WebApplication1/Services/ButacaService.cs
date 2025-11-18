using WebApplication1.DTOs.Butaca;
using WebApplication1.Repositories.Interfaces;
using WebApplication1.Services.Interfaces;

namespace WebApplication1.Services
{
    public class ButacaService : IButacaService
    {
        private readonly IButacaRepository _repository;

        public ButacaService(IButacaRepository repository)
        {
            _repository = repository;
        }

        public Task<IEnumerable<ButacaDTO>> GetAllAsync(int? salaId = null) => _repository.GetAllAsync(salaId);

        public Task<ButacaDTO?> GetByIdAsync(int id) => _repository.GetByIdAsync(id);

        public Task<ButacaDTO> CreateAsync(ButacaCreateDTO dto) => _repository.CreateAsync(dto);

        public Task<ButacaDTO?> UpdateAsync(ButacaUpdateDTO dto) => _repository.UpdateAsync(dto);

        public Task<bool> DeleteAsync(int id) => _repository.DeleteAsync(id);
    }
}

