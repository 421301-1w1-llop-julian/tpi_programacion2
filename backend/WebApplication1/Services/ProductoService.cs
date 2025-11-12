using Microsoft.AspNetCore.Http.HttpResults;
using WebApplication1.DTOs.Producto;
using WebApplication1.DTOs.TiposUsuariosDTO;
using WebApplication1.Models;
using WebApplication1.Repositories.Interfaces;
using WebApplication1.Services.Interfaces;

namespace WebApplication1.Services
{
    public class ProductoService : IProductoService
    {
        private readonly IProductosRepository _repository;

        public ProductoService(IProductosRepository repository)
        {
            _repository = repository;
        }

        public async Task<ProductoDTO> CreateAsync(ProductoCreateUpdateDTO dto)
        {
            var entity = new Producto
            {
                Nombre = dto.Nombre,
                Descripcion = dto.Descripcion,
                Precio = dto.Precio,
                IdTipoProducto = dto.IdTipoProducto,
                Imagen = dto.Imagen,
            };

            var created = await _repository.AddAsync(entity);

            return new ProductoDTO
            {
                IdProducto = created.IdProducto,
                Nombre = created.Nombre,
                Descripcion = created.Descripcion,
                Precio = created.Precio,
                IdTipoProducto = created.IdTipoProducto,
                Imagen = dto.Imagen,
            };
        }

        public async Task<bool> DeleteAsync(int id)
        {
            if (!await _repository.ExistsAsync(id))
                return false;

            await _repository.DeleteAsync(id);
            return true;
        }

        public async Task<IEnumerable<ProductoDTO>> GetAllAsync()
        {
            var producto = await _repository.GetAllAsync();
            return producto.Select(t => new ProductoDTO
            {
                IdProducto = t.IdProducto,
                Nombre = t.Nombre,
                Descripcion = t.Descripcion,
                Precio = t.Precio,
                IdTipoProducto = t.IdTipoProducto,
                Imagen = t.Imagen
            });
        }

        public async Task<ProductoDTO> GetByIdAsync(int id)
        {
            var p = await _repository.GetByIdAsync(id);
            if (p == null)
                return null;

            return new ProductoDTO
            {
                IdProducto = p.IdProducto,
                Nombre = p.Nombre,
                Descripcion = p.Descripcion,
                Precio = p.Precio,
                IdTipoProducto = p.IdTipoProducto,
                Imagen = p.Imagen
            };
        }

        public async Task<bool> UpdateAsync(int id, ProductoCreateUpdateDTO dto)
        {
            if (!await _repository.ExistsAsync(id))
                return false;

            var entity = new Producto
            {
                IdProducto = id,
                Nombre = dto.Nombre,
                Descripcion = dto.Descripcion,
                Precio = dto.Precio,
                IdTipoProducto = dto.IdTipoProducto,
                Imagen = dto.Imagen
            };

            await _repository.UpdateAsync(entity);
            return true;
        }
    }
}
