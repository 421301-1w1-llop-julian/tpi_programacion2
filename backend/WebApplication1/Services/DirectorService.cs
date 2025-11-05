using WebApplication1.DTOs.DirectorDTO;
using WebApplication1.Models;
using WebApplication1.Repositories.Interfaces;
using WebApplication1.Services.Interfaces;

namespace WebApplication1.Services
{
    public class DirectorService : IDirectorService
    {
        private readonly IDirectorRepository _repository;

        public DirectorService(IDirectorRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<DirectorDTO>> GetAllAsync()
        {
            var directores = await _repository.GetAllAsync();
            return directores.Select(d => new DirectorDTO
            {
                IdDirector = d.IdDirector,
                Nombre = d.Nombre,
                Apellido = d.Apellido,
                IdPais = d.IdPais,
                PaisNombre = d.IdPaisNavigation?.Nombre ?? string.Empty
            });
        }

        public async Task<DirectorDTO> GetByIdAsync(int id)
        {
            var director = await _repository.GetByIdAsync(id);
            if (director == null)
                return null;

            return new DirectorDTO
            {
                IdDirector = director.IdDirector,
                Nombre = director.Nombre,
                Apellido = director.Apellido,
                IdPais = director.IdPais,
                PaisNombre = director.IdPaisNavigation?.Nombre ?? string.Empty
            };
        }

        public async Task<DirectorDTO> CreateAsync(DirectorCreateUpdateDTO dto)
        {
            var entity = new Director
            {
                Nombre = dto.Nombre,
                Apellido = dto.Apellido,
                IdPais = dto.IdPais
            };

            var created = await _repository.AddAsync(entity);
            var directorWithPais = await _repository.GetByIdAsync(created.IdDirector);

            return new DirectorDTO
            {
                IdDirector = directorWithPais.IdDirector,
                Nombre = directorWithPais.Nombre,
                Apellido = directorWithPais.Apellido,
                IdPais = directorWithPais.IdPais,
                PaisNombre = directorWithPais.IdPaisNavigation?.Nombre ?? string.Empty
            };
        }

        public async Task<bool> UpdateAsync(int id, DirectorCreateUpdateDTO dto)
        {
            if (!await _repository.ExistsAsync(id))
                return false;

            var entity = new Director
            {
                IdDirector = id,
                Nombre = dto.Nombre,
                Apellido = dto.Apellido,
                IdPais = dto.IdPais
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

