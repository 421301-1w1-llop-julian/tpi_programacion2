using WebApplication1.DTOs.IdiomaDTO;
using WebApplication1.Models;
using WebApplication1.Repositories.Interfaces;
using WebApplication1.Services.Interfaces;

namespace WebApplication1.Services
{
    public class IdiomaService : IIdiomaService
    {
        private readonly IIdiomaRepository _repository;

        public IdiomaService(IIdiomaRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<IdiomaDTO>> GetAllAsync()
        {
            var idiomas = await _repository.GetAllAsync();
            return idiomas.Select(i => new IdiomaDTO
            {
                IdIdioma = i.IdIdioma,
                Nombre = i.Nombre,
                Subtitulado = i.Subtitulado,
                Doblado = i.Doblado
            });
        }

        public async Task<IdiomaDTO> GetByIdAsync(int id)
        {
            var idioma = await _repository.GetByIdAsync(id);
            if (idioma == null)
                return null;

            return new IdiomaDTO
            {
                IdIdioma = idioma.IdIdioma,
                Nombre = idioma.Nombre,
                Subtitulado = idioma.Subtitulado,
                Doblado = idioma.Doblado
            };
        }

        public async Task<IdiomaDTO> CreateAsync(IdiomaCreateUpdateDTO dto)
        {
            var entity = new Idioma
            {
                Nombre = dto.Nombre,
                Subtitulado = dto.Subtitulado,
                Doblado = dto.Doblado
            };

            var created = await _repository.AddAsync(entity);

            return new IdiomaDTO
            {
                IdIdioma = created.IdIdioma,
                Nombre = created.Nombre,
                Subtitulado = created.Subtitulado,
                Doblado = created.Doblado
            };
        }

        public async Task<bool> UpdateAsync(int id, IdiomaCreateUpdateDTO dto)
        {
            if (!await _repository.ExistsAsync(id))
                return false;

            var entity = new Idioma
            {
                IdIdioma = id,
                Nombre = dto.Nombre,
                Subtitulado = dto.Subtitulado,
                Doblado = dto.Doblado
            };

            await _repository.UpdateAsync(entity);
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            if (!await _repository.ExistsAsync(id))
                return false;

            await _repository.DeleteAsync(id);
            return true;
        }
    }
}

