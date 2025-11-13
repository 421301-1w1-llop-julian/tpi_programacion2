using Microsoft.EntityFrameworkCore;
using System.Linq;
using WebApplication1.DTOs.ButacasFuncion;
using WebApplication1.Models;
using WebApplication1.Repositories.Interfaces;

namespace WebApplication1.Repositories
{
    public class ButacasFuncionRepository : IButacasFuncionRepository
    {
        private readonly CINE_2025_1W1_GRUPO_5Context _context;

        public ButacasFuncionRepository(CINE_2025_1W1_GRUPO_5Context context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ButacasFuncionDTO>> GetAllAsync(int? funcionId = null)
        {
            var query = _context.ButacasFuncions
                .Include(bf => bf.IdButacaNavigation)
                    .ThenInclude(b => b.IdTipoButacaNavigation)
                .Include(bf => bf.IdButacaNavigation)
                    .ThenInclude(b => b.IdSalaNavigation)
                .Include(bf => bf.IdEstadoButacaNavigation)
                .AsQueryable();

            if (funcionId.HasValue)
            {
                query = query.Where(bf => bf.IdFuncion == funcionId.Value);
            }

            return await query.Select(bf => MapToDto(bf)).ToListAsync();
        }

        public async Task<ButacasFuncionDTO?> GetByIdAsync(int id)
        {
            var entity = await _context.ButacasFuncions
                .Include(bf => bf.IdButacaNavigation)
                    .ThenInclude(b => b.IdTipoButacaNavigation)
                .Include(bf => bf.IdButacaNavigation)
                    .ThenInclude(b => b.IdSalaNavigation)
                .Include(bf => bf.IdEstadoButacaNavigation)
                .FirstOrDefaultAsync(bf => bf.IdButacaFuncion == id);

            return entity == null ? null : MapToDto(entity);
        }

        public async Task<ButacasFuncionDTO> CreateAsync(ButacasFuncionCreateDTO dto)
        {
            // Validate function
            var funcion = await _context.Funciones.FindAsync(dto.IdFuncion);
            if (funcion == null)
            {
                throw new ArgumentException($"La función con ID {dto.IdFuncion} no existe.");
            }

            // Validate seat
            var butaca = await _context.Butacas.FindAsync(dto.IdButaca);
            if (butaca == null)
            {
                throw new ArgumentException($"La butaca con ID {dto.IdButaca} no existe.");
            }

            // Validate estado butaca
            var estado = await _context.EstadoButacas.FindAsync(dto.IdEstadoButaca);
            if (estado == null)
            {
                throw new ArgumentException($"El estado de butaca con ID {dto.IdEstadoButaca} no existe.");
            }

            var entity = new ButacasFuncion
            {
                IdFuncion = dto.IdFuncion,
                IdButaca = dto.IdButaca,
                IdEstadoButaca = dto.IdEstadoButaca,
                IdReserva = dto.IdReserva,
                IdCompra = dto.IdCompra
            };

            _context.ButacasFuncions.Add(entity);
            await _context.SaveChangesAsync();

            return await GetByIdAsync(entity.IdButacaFuncion)
                ?? throw new InvalidOperationException("No se pudo obtener la butaca de función recién creada.");
        }

        public async Task<ButacasFuncionDTO?> UpdateAsync(ButacasFuncionUpdateDTO dto)
        {
            var entity = await _context.ButacasFuncions.FindAsync(dto.IdButacaFuncion);
            if (entity == null) return null;

            if (dto.IdFuncion.HasValue && dto.IdFuncion.Value != entity.IdFuncion)
            {
                var funcion = await _context.Funciones.FindAsync(dto.IdFuncion.Value);
                if (funcion == null)
                {
                    throw new ArgumentException($"La función con ID {dto.IdFuncion.Value} no existe.");
                }
                entity.IdFuncion = dto.IdFuncion.Value;
            }

            if (dto.IdButaca.HasValue && dto.IdButaca.Value != entity.IdButaca)
            {
                var butaca = await _context.Butacas.FindAsync(dto.IdButaca.Value);
                if (butaca == null)
                {
                    throw new ArgumentException($"La butaca con ID {dto.IdButaca.Value} no existe.");
                }
                entity.IdButaca = dto.IdButaca.Value;
            }

            if (dto.IdEstadoButaca.HasValue && dto.IdEstadoButaca.Value != entity.IdEstadoButaca)
            {
                var estado = await _context.EstadoButacas.FindAsync(dto.IdEstadoButaca.Value);
                if (estado == null)
                {
                    throw new ArgumentException($"El estado de butaca con ID {dto.IdEstadoButaca.Value} no existe.");
                }
                entity.IdEstadoButaca = dto.IdEstadoButaca.Value;
            }

            if (dto.IdReserva.HasValue)
            {
                entity.IdReserva = dto.IdReserva.Value;
            }

            if (dto.IdCompra.HasValue)
            {
                entity.IdCompra = dto.IdCompra.Value;
            }

            await _context.SaveChangesAsync();

            return await GetByIdAsync(entity.IdButacaFuncion);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var entity = await _context.ButacasFuncions
                .Include(bf => bf.DetallesCompras)
                .FirstOrDefaultAsync(bf => bf.IdButacaFuncion == id);

            if (entity == null) return false;

            if (entity.DetallesCompras.Any())
            {
                throw new InvalidOperationException("No se puede eliminar la butaca de función porque tiene compras asociadas.");
            }

            _context.ButacasFuncions.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }

        private static ButacasFuncionDTO MapToDto(ButacasFuncion bf)
        {
            return new ButacasFuncionDTO
            {
                IdButacaFuncion = bf.IdButacaFuncion,
                IdFuncion = bf.IdFuncion,
                IdButaca = bf.IdButaca,
                IdEstadoButaca = bf.IdEstadoButaca,
                IdReserva = bf.IdReserva,
                IdCompra = bf.IdCompra,
                Fila = bf.IdButacaNavigation?.Fila,
                NumeroButaca = bf.IdButacaNavigation?.NumeroButaca,
                IdSala = bf.IdButacaNavigation?.IdSala,
                TipoButaca = bf.IdButacaNavigation?.IdTipoButacaNavigation?.Nombre
            };
        }
    }
}

