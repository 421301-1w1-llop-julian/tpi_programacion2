using WebApplication1.DTOs.TiposUsuariosDTO;
using WebApplication1.Models;
using WebApplication1.Repositories.Interfaces;
using WebApplication1.Services.Interfaces;

namespace WebApplication1.Services
{
    public class TiposUsuarioService : ITiposUsuarioService
    {
        private readonly ITiposUsuarioRepository _repository;

        public TiposUsuarioService(ITiposUsuarioRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<TiposUsuarioDTO>> GetAllAsync()
        {
            var tipos = await _repository.GetAllAsync();
            return tipos.Select(t => new TiposUsuarioDTO
            {
                IdTipoUsuario = t.IdTipoUsuario,
                TipoUsuario = t.TipoUsuario,
                Descripcion = t.Descripcion
            });
        }

        public async Task<TiposUsuarioDTO> GetByIdAsync(int id)
        {
            var tipo = await _repository.GetByIdAsync(id);
            if (tipo == null)
                return null;

            return new TiposUsuarioDTO
            {
                IdTipoUsuario = tipo.IdTipoUsuario,
                TipoUsuario = tipo.TipoUsuario,
                Descripcion = tipo.Descripcion
            };
        }

        public async Task<TiposUsuarioDTO> CreateAsync(TiposUsuarioCreateUpdateDTO dto)
        {
            var entity = new TiposUsuario
            {
                TipoUsuario = dto.TipoUsuario,
                Descripcion = dto.Descripcion
            };

            var created = await _repository.AddAsync(entity);

            return new TiposUsuarioDTO
            {
                IdTipoUsuario = created.IdTipoUsuario,
                TipoUsuario = created.TipoUsuario,
                Descripcion = created.Descripcion
            };
        }

        public async Task<bool> UpdateAsync(int id, TiposUsuarioCreateUpdateDTO dto)
        {
            if (!await _repository.ExistsAsync(id))
                return false;

            var entity = new TiposUsuario
            {
                IdTipoUsuario = id,
                TipoUsuario = dto.TipoUsuario,
                Descripcion = dto.Descripcion
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
