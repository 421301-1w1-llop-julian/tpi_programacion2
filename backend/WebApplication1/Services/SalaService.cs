using WebApplication1.DTOs.Sala;
using WebApplication1.Models;
using WebApplication1.Repositories.Interfaces;
using WebApplication1.Services.Interfaces;

namespace WebApplication1.Services
{
    public class SalaService : ISalaService
    {
        private readonly ISalaRepository _repository;

        public SalaService(ISalaRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<SalaDTO>> GetAllAsync()
        {
            var salas = await _repository.GetAllAsync();
            return salas.Select(MapToDto);
        }

        public async Task<SalaDTO?> GetByIdAsync(int id)
        {
            var sala = await _repository.GetByIdAsync(id);
            return sala == null ? null : MapToDto(sala);
        }

        public async Task<SalaDTO> CreateAsync(SalaCreateUpdateDTO dto)
        {
            var entity = new Sala
            {
                IdCine = dto.IdCine,
                NumeroSala = dto.NumeroSala,
                Capacidad = dto.Capacidad,
                IdTipoSala = dto.IdTipoSala
            };

            var created = await _repository.AddAsync(entity);
            var salaWithNav = await _repository.GetByIdAsync(created.IdSala);
            return MapToDto(salaWithNav ?? created);
        }

        public async Task<bool> UpdateAsync(int id, SalaCreateUpdateDTO dto)
        {
            if (!await _repository.ExistsAsync(id))
                return false;

            var entity = new Sala
            {
                IdSala = id,
                IdCine = dto.IdCine,
                NumeroSala = dto.NumeroSala,
                Capacidad = dto.Capacidad,
                IdTipoSala = dto.IdTipoSala
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

        private static SalaDTO MapToDto(Sala sala)
        {
            return new SalaDTO
            {
                IdSala = sala.IdSala,
                NumeroSala = sala.NumeroSala,
                Capacidad = sala.Capacidad,
                IdCine = sala.IdCine,
                CineNombre = sala.IdCineNavigation?.Nombre,
                IdTipoSala = sala.IdTipoSala,
                TipoSalaNombre = sala.IdTipoSalaNavigation?.Nombre
            };
        }
    }
}

