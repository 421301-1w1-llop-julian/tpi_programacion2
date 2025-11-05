using WebApplication1.DTOs.GeneroDTO;
using WebApplication1.Models;
using WebApplication1.Repositories.Interfaces;
using WebApplication1.Services.Interfaces;

namespace WebApplication1.Services
{
    public class GeneroService : IGeneroService
    {
        private readonly IGeneroRepository _repository;

        public GeneroService(IGeneroRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<GeneroDTO>> GetAllAsync()
        {
            var generos = await _repository.GetAllAsync();
            return generos.Select(g => new GeneroDTO
            {
                IdGenero = g.IdGenero,
                Nombre = g.Nombre
            });
        }

        public async Task<GeneroDTO> GetByIdAsync(int id)
        {
            var genero = await _repository.GetByIdAsync(id);
            if (genero == null)
                return null;

            return new GeneroDTO
            {
                IdGenero = genero.IdGenero,
                Nombre = genero.Nombre
            };
        }

        public async Task<GeneroDTO> CreateAsync(GeneroCreateUpdateDTO dto)
        {
            var entity = new Genero
            {
                Nombre = dto.Nombre
            };

            var created = await _repository.AddAsync(entity);

            return new GeneroDTO
            {
                IdGenero = created.IdGenero,
                Nombre = created.Nombre
            };
        }

        public async Task<bool> UpdateAsync(int id, GeneroCreateUpdateDTO dto)
        {
            if (!await _repository.ExistsAsync(id))
                return false;

            var entity = new Genero
            {
                IdGenero = id,
                Nombre = dto.Nombre
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

