using WebApplication1.DTOs.PaisDTO;
using WebApplication1.Models;
using WebApplication1.Repositories.Interfaces;
using WebApplication1.Services.Interfaces;

namespace WebApplication1.Services
{
    public class PaisService : IPaisService
    {
        private readonly IPaisRepository _repository;

        public PaisService(IPaisRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<PaisDTO>> GetAllAsync()
        {
            var paises = await _repository.GetAllAsync();
            return paises.Select(p => new PaisDTO
            {
                IdPais = p.IdPais,
                Nombre = p.Nombre
            });
        }

        public async Task<PaisDTO> GetByIdAsync(int id)
        {
            var pais = await _repository.GetByIdAsync(id);
            if (pais == null)
                return null;

            return new PaisDTO
            {
                IdPais = pais.IdPais,
                Nombre = pais.Nombre
            };
        }

        public async Task<PaisDTO> CreateAsync(PaisCreateUpdateDTO dto)
        {
            var entity = new Pais
            {
                Nombre = dto.Nombre
            };

            var created = await _repository.AddAsync(entity);

            return new PaisDTO
            {
                IdPais = created.IdPais,
                Nombre = created.Nombre
            };
        }

        public async Task<bool> UpdateAsync(int id, PaisCreateUpdateDTO dto)
        {
            if (!await _repository.ExistsAsync(id))
                return false;

            var entity = new Pais
            {
                IdPais = id,
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

