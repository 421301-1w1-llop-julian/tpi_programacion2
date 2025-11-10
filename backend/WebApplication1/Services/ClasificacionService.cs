using WebApplication1.DTOs.ClasificacionDTO;
using WebApplication1.Models;
using WebApplication1.Repositories.Interfaces;
using WebApplication1.Services.Interfaces;

namespace WebApplication1.Services
{
    public class ClasificacionService : IClasificacionService
    {
        private readonly IClasificacionRepository _repository;

        public ClasificacionService(IClasificacionRepository repository)
        {
            _repository = repository;
        }

        public async Task<List<ClasificacionResponseDTO>> GetAllAsync()
        {
            var clasificaciones = await _repository.GetAllAsync();
            return clasificaciones.Select(c => new ClasificacionResponseDTO
            {
                IdClasificacion = c.IdClasificacion,
                Nombre = c.Nombre,
                Descripcion = c.Descripcion
            }).ToList();
        }

        public async Task<ClasificacionResponseDTO?> GetByIdAsync(int id)
        {
            var clasificacion = await _repository.GetByIdAsync(id);
            if (clasificacion == null) return null;

            return new ClasificacionResponseDTO
            {
                IdClasificacion = clasificacion.IdClasificacion,
                Nombre = clasificacion.Nombre,
                Descripcion = clasificacion.Descripcion
            };
        }

        public async Task<ClasificacionResponseDTO> CreateAsync(ClasificacionCreateDTO dto)
        {
            var clasificacion = new ClasificacionesPelicula
            {
                Nombre = dto.Nombre,
                Descripcion = dto.Descripcion
            };

            var created = await _repository.CreateAsync(clasificacion);
            return new ClasificacionResponseDTO
            {
                IdClasificacion = created.IdClasificacion,
                Nombre = created.Nombre,
                Descripcion = created.Descripcion
            };
        }

        public async Task<bool> UpdateAsync(int id, ClasificacionCreateDTO dto)
        {
            var clasificacion = await _repository.GetByIdAsync(id);
            if (clasificacion == null) return false;

            clasificacion.Nombre = dto.Nombre;
            clasificacion.Descripcion = dto.Descripcion;

            return await _repository.UpdateAsync(clasificacion);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            return await _repository.DeleteAsync(id);
        }
    }
}