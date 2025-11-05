using WebApplication1.DTOs.TiposProductoDTO;
using WebApplication1.DTOs.TiposUsuariosDTO;
using WebApplication1.Models;
using WebApplication1.Repositories.Interfaces;
using WebApplication1.Services.Interfaces;

namespace WebApplication1.Services
{
    public class TiposProductoService : ITiposProductoService
    {
        private readonly ITiposProductoRepository _repository;
        public TiposProductoService(ITiposProductoRepository repository)
        {
            _repository = repository;
        }

        public async Task<TiposProductoDTO> CreateAsync(TiposProductoCreateUpdateDTO dto)
        {
            var entity = new TiposProducto
            {
                Nombre = dto.TipoProducto
            };

            var created = await _repository.AddAsync(entity);

            return new TiposProductoDTO
            {
                IdTipoProducto = created.IdTipoProducto,
                TipoProducto = created.Nombre,
            };
        }

        public async Task<bool> DeleteAsync(int id)
        {
            if (!await _repository.ExistsAsync(id))
                return false;

            await _repository.DeleteAsync(id);
            return true;
        }

        public async Task<IEnumerable<TiposProductoDTO>> GetAllAsync()
        {
            var tipos = await _repository.GetAllAsync();
            return tipos.Select(t => new TiposProductoDTO
            {
                IdTipoProducto = t.IdTipoProducto,
                TipoProducto = t.Nombre
            });
        }

        public async Task<TiposProductoDTO> GetByIdAsync(int id)
        {
            var tipo = await _repository.GetByIdAsync(id);
            if (tipo == null)
                return null;

            return new TiposProductoDTO
            {
                IdTipoProducto = tipo.IdTipoProducto,
                TipoProducto = tipo.Nombre,
            };
        }

        public async Task<bool> UpdateAsync(int id, TiposProductoCreateUpdateDTO dto)
        {
            if (!await _repository.ExistsAsync(id))
                return false;

            var entity = new TiposProducto
            {
                IdTipoProducto = id,
                Nombre = dto.TipoProducto
            };

            await _repository.UpdateAsync(entity);
            return true;
        }
    }
}
