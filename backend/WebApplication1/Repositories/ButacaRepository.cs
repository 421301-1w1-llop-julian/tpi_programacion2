using Microsoft.EntityFrameworkCore;
using System.Linq;
using WebApplication1.DTOs.Butaca;
using WebApplication1.Models;
using WebApplication1.Repositories.Interfaces;

namespace WebApplication1.Repositories
{
    public class ButacaRepository : IButacaRepository
    {
        private readonly CINE_2025_1W1_GRUPO_5Context _context;

        public ButacaRepository(CINE_2025_1W1_GRUPO_5Context context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ButacaDTO>> GetAllAsync(int? salaId = null)
        {
            var query = _context.Butacas
                .Include(b => b.IdSalaNavigation)
                .Include(b => b.IdTipoButacaNavigation)
                .AsQueryable();

            if (salaId.HasValue)
            {
                query = query.Where(b => b.IdSala == salaId.Value);
            }

            return await query
                .Select(b => new ButacaDTO
                {
                    IdButaca = b.IdButaca,
                    IdSala = b.IdSala,
                    NumeroButaca = b.NumeroButaca,
                    Fila = b.Fila,
                    IdTipoButaca = b.IdTipoButaca,
                    SalaNombre = b.IdSalaNavigation != null
                        ? $"Sala {b.IdSalaNavigation.NumeroSala}"
                        : null,
                    SalaNumero = b.IdSalaNavigation?.NumeroSala,
                    TipoButaca = b.IdTipoButacaNavigation?.Nombre
                })
                .ToListAsync();
        }

        public async Task<ButacaDTO?> GetByIdAsync(int id)
        {
            var butaca = await _context.Butacas
                .Include(b => b.IdSalaNavigation)
                .Include(b => b.IdTipoButacaNavigation)
                .FirstOrDefaultAsync(b => b.IdButaca == id);

            if (butaca == null) return null;

            return new ButacaDTO
            {
                IdButaca = butaca.IdButaca,
                IdSala = butaca.IdSala,
                NumeroButaca = butaca.NumeroButaca,
                Fila = butaca.Fila,
                IdTipoButaca = butaca.IdTipoButaca,
                SalaNombre = butaca.IdSalaNavigation != null
                        ? $"Sala {butaca.IdSalaNavigation.NumeroSala}"
                        : null,
                SalaNumero = butaca.IdSalaNavigation?.NumeroSala,
                TipoButaca = butaca.IdTipoButacaNavigation?.Nombre
            };
        }

        public async Task<ButacaDTO> CreateAsync(ButacaCreateDTO dto)
        {
            // Validate sala
            var sala = await _context.Salas.FindAsync(dto.IdSala);
            if (sala == null)
            {
                throw new ArgumentException($"La sala con ID {dto.IdSala} no existe.");
            }

            // Validate tipo butaca
            var tipoButaca = await _context.TiposButacas.FindAsync(dto.IdTipoButaca);
            if (tipoButaca == null)
            {
                throw new ArgumentException($"El tipo de butaca con ID {dto.IdTipoButaca} no existe.");
            }

            var entity = new Butaca
            {
                IdSala = dto.IdSala,
                NumeroButaca = dto.NumeroButaca,
                Fila = dto.Fila,
                IdTipoButaca = dto.IdTipoButaca
            };

            _context.Butacas.Add(entity);
            await _context.SaveChangesAsync();

            return await GetByIdAsync(entity.IdButaca)
                ?? throw new InvalidOperationException("No se pudo obtener la butaca recién creada.");
        }

        public async Task<ButacaDTO?> UpdateAsync(ButacaUpdateDTO dto)
        {
            var entity = await _context.Butacas.FindAsync(dto.IdButaca);
            if (entity == null) return null;

            if (dto.IdSala.HasValue && dto.IdSala.Value != entity.IdSala)
            {
                var sala = await _context.Salas.FindAsync(dto.IdSala.Value);
                if (sala == null)
                {
                    throw new ArgumentException($"La sala con ID {dto.IdSala.Value} no existe.");
                }
                entity.IdSala = dto.IdSala.Value;
            }

            if (dto.NumeroButaca.HasValue)
            {
                entity.NumeroButaca = dto.NumeroButaca.Value;
            }

            if (!string.IsNullOrWhiteSpace(dto.Fila))
            {
                entity.Fila = dto.Fila;
            }

            if (dto.IdTipoButaca.HasValue && dto.IdTipoButaca.Value != entity.IdTipoButaca)
            {
                var tipo = await _context.TiposButacas.FindAsync(dto.IdTipoButaca.Value);
                if (tipo == null)
                {
                    throw new ArgumentException($"El tipo de butaca con ID {dto.IdTipoButaca.Value} no existe.");
                }
                entity.IdTipoButaca = dto.IdTipoButaca.Value;
            }

            await _context.SaveChangesAsync();

            return await GetByIdAsync(entity.IdButaca);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var entity = await _context.Butacas
                .Include(b => b.ButacasFuncions)
                .Include(b => b.DetalleReservas)
                .FirstOrDefaultAsync(b => b.IdButaca == id);

            if (entity == null) return false;

            if (entity.ButacasFuncions.Any() || entity.DetalleReservas.Any())
            {
                throw new InvalidOperationException("No se puede eliminar la butaca porque está asociada a funciones o reservas.");
            }

            _context.Butacas.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}

