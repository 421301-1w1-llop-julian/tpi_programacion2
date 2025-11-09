using WebApplication1.DTOs.Pelicula;
using WebApplication1.Repositories.Interfaces;
using WebApplication1.Services.Interfaces;

namespace WebApplication1.Services
{
    public class PeliculaService : IPeliculaService
    {
        private readonly IPeliculaRepository _repository;

        public PeliculaService(IPeliculaRepository repository)
        {
            _repository = repository;
        }

        public Task<IEnumerable<PeliculaListDTO>> GetAllAsync() => _repository.GetAllAsync();
        public Task<PeliculaDTO> GetByIdAsync(int id) => _repository.GetByIdAsync(id);
        public Task<PeliculaDTO> CreateAsync(PeliculaCreateDTO dto) => _repository.CreateAsync(dto);
        public Task<PeliculaDTO> UpdateAsync(PeliculaUpdateDTO dto) => _repository.UpdateAsync(dto);
        public Task<bool> DeleteAsync(int id) => _repository.DeleteAsync(id);
    }
}
