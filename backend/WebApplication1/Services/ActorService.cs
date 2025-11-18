using WebApplication1.DTOs.ActorDTO;
using WebApplication1.Models;
using WebApplication1.Repositories.Interfaces;
using WebApplication1.Services.Interfaces;

namespace WebApplication1.Services
{
    public class ActorService : IActorService
    {
        private readonly IActorRepository _repository;

        public ActorService(IActorRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<ActorDTO>> GetAllAsync()
        {
            var actores = await _repository.GetAllAsync();
            return actores.Select(a => new ActorDTO
            {
                IdActor = a.IdActor,
                Nombre = a.Nombre,
                Apellido = a.Apellido,
                IdPais = a.IdPais,
                PaisNombre = a.IdPaisNavigation?.Nombre ?? string.Empty
            });
        }

        public async Task<ActorDTO> GetByIdAsync(int id)
        {
            var actor = await _repository.GetByIdAsync(id);
            if (actor == null)
                return null;

            return new ActorDTO
            {
                IdActor = actor.IdActor,
                Nombre = actor.Nombre,
                Apellido = actor.Apellido,
                IdPais = actor.IdPais,
                PaisNombre = actor.IdPaisNavigation?.Nombre ?? string.Empty
            };
        }

        public async Task<ActorDTO> CreateAsync(ActorCreateUpdateDTO dto)
        {
            var entity = new Actor
            {
                Nombre = dto.Nombre,
                Apellido = dto.Apellido,
                IdPais = dto.IdPais
            };

            var created = await _repository.AddAsync(entity);
            var actorWithPais = await _repository.GetByIdAsync(created.IdActor);

            return new ActorDTO
            {
                IdActor = actorWithPais.IdActor,
                Nombre = actorWithPais.Nombre,
                Apellido = actorWithPais.Apellido,
                IdPais = actorWithPais.IdPais,
                PaisNombre = actorWithPais.IdPaisNavigation?.Nombre ?? string.Empty
            };
        }

        public async Task<bool> UpdateAsync(int id, ActorCreateUpdateDTO dto)
        {
            if (!await _repository.ExistsAsync(id))
                return false;

            var entity = new Actor
            {
                IdActor = id,
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

