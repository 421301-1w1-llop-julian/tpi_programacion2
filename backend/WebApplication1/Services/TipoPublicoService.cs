using WebApplication1.DTOs.TipoPublicoDTO;
using WebApplication1.Models;
using WebApplication1.Repositories.Interfaces;
using WebApplication1.Services.Interfaces;

namespace WebApplication1.Services
{
    public class TipoPublicoService : ITipoPublicoService
    {
        private readonly ITipoPublicoRepository _repository;

        public TipoPublicoService(ITipoPublicoRepository repository)
        {
            _repository = repository;
        }

        public async Task<List<TipoPublicoResponseDTO>> GetAllAsync()
        {
            var tiposPublico = await _repository.GetAllAsync();
            return tiposPublico.Select(t => new TipoPublicoResponseDTO
            {
                IdTipoPublico = t.IdTipoPublico,
                Nombre = t.Nombre,
                EdadMinima = t.EdadMinima,
                EdadMaxima = t.EdadMaxima
            }).ToList();
        }

        public async Task<TipoPublicoResponseDTO?> GetByIdAsync(int id)
        {
            var tipoPublico = await _repository.GetByIdAsync(id);
            if (tipoPublico == null) return null;

            return new TipoPublicoResponseDTO
            {
                IdTipoPublico = tipoPublico.IdTipoPublico,
                Nombre = tipoPublico.Nombre,
                EdadMinima = tipoPublico.EdadMinima,
                EdadMaxima = tipoPublico.EdadMaxima
            };
        }

        public async Task<TipoPublicoResponseDTO> CreateAsync(TipoPublicoCreateDTO dto)
        {
            var tipoPublico = new TiposPublico
            {
                Nombre = dto.Nombre,
                EdadMinima = dto.EdadMinima,
                EdadMaxima = dto.EdadMaxima
            };

            var created = await _repository.CreateAsync(tipoPublico);
            return new TipoPublicoResponseDTO
            {
                IdTipoPublico = created.IdTipoPublico,
                Nombre = created.Nombre,
                EdadMinima = created.EdadMinima,
                EdadMaxima = created.EdadMaxima
            };
        }

        public async Task<bool> UpdateAsync(int id, TipoPublicoCreateDTO dto)
        {
            var tipoPublico = await _repository.GetByIdAsync(id);
            if (tipoPublico == null) return false;

            tipoPublico.Nombre = dto.Nombre;
            tipoPublico.EdadMinima = dto.EdadMinima;
            tipoPublico.EdadMaxima = dto.EdadMaxima;

            return await _repository.UpdateAsync(tipoPublico);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            return await _repository.DeleteAsync(id);
        }
    }
}