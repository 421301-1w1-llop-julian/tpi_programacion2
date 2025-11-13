using Microsoft.EntityFrameworkCore;
using WebApplication1.DTOs.Funcion;
using WebApplication1.Models;
using WebApplication1.Repositories.Interfaces;

namespace WebApplication1.Repositories
{
    public class FuncionRepository : IFuncionRepository
    {
        private readonly CINE_2025_1W1_GRUPO_5Context _context;

        public FuncionRepository(CINE_2025_1W1_GRUPO_5Context context)
        {
            _context = context;
        }

        public async Task<IEnumerable<FuncionListDTO>> GetAllAsync()
        {
            return await _context.Funciones
                .Include(f => f.IdPeliculaNavigation)
                .Include(f => f.IdSalaNavigation)
                .Select(f => new FuncionListDTO
                {
                    IdFuncion = f.IdFuncion,
                    TituloPelicula = f.IdPeliculaNavigation.Nombre,
                    NombreSala = $"Sala {f.IdSalaNavigation.NumeroSala}",
                    FechaHoraInicio = f.FechaHoraInicio,
                    PrecioBase = f.PrecioBase
                })
                .ToListAsync();
        }

        public async Task<FuncionDTO> GetByIdAsync(int id)
        {
            var funcion = await _context.Funciones
                .Include(f => f.IdPeliculaNavigation)
                .Include(f => f.IdSalaNavigation)
                .Include(f => f.ButacasFuncions)
                .Include(f => f.DetalleReservas)
                .Include(f => f.DetallesCompras)
                .Include(f => f.FechasHorasEspeciales)
                .FirstOrDefaultAsync(f => f.IdFuncion == id);

            if (funcion == null) return null;

            return new FuncionDTO
            {
                IdFuncion = funcion.IdFuncion,
                IdPelicula = funcion.IdPelicula,
                TituloPelicula = funcion.IdPeliculaNavigation?.Nombre ?? "",
                IdSala = funcion.IdSala,
                NombreSala = $"Sala {funcion.IdSalaNavigation?.NumeroSala ?? 0}",
                FechaHoraInicio = funcion.FechaHoraInicio,
                PrecioBase = funcion.PrecioBase,
                ButacasFuncionIds = funcion.ButacasFuncions?.Select(bf => bf.IdButacaFuncion).ToList(),
                DetalleReservaIds = funcion.DetalleReservas?.Select(dr => dr.IdDetalleReserva).ToList(),
                DetalleCompraIds = funcion.DetallesCompras?.Select(dc => dc.IdDetalleCompra).ToList(),
                FechasHorasEspecialesIds = funcion.FechasHorasEspeciales?.Select(fhe => fhe.IdFechasHorasEspecial).ToList()
            };
        }

        public async Task<FuncionDTO> CreateAsync(FuncionCreateDTO dto)
        {
            // Validar que la película existe
            var pelicula = await _context.Peliculas.FindAsync(dto.IdPelicula);
            if (pelicula == null)
                throw new ArgumentException($"La película con ID {dto.IdPelicula} no existe.");

            // Validar que la sala existe
            var sala = await _context.Salas.FindAsync(dto.IdSala);
            if (sala == null)
                throw new ArgumentException($"La sala con ID {dto.IdSala} no existe.");

            var funcion = new Funcion
            {
                IdPelicula = dto.IdPelicula,
                IdSala = dto.IdSala,
                FechaHoraInicio = dto.FechaHoraInicio,
                PrecioBase = dto.PrecioBase
            };

            _context.Funciones.Add(funcion);
            await _context.SaveChangesAsync();

            return await GetByIdAsync(funcion.IdFuncion);
        }

        public async Task<FuncionDTO> UpdateAsync(FuncionUpdateDTO dto)
        {
            var funcion = await _context.Funciones.FindAsync(dto.IdFuncion);
            if (funcion == null) return null;

            // Validar película si se proporciona
            if (dto.IdPelicula.HasValue)
            {
                var pelicula = await _context.Peliculas.FindAsync(dto.IdPelicula.Value);
                if (pelicula == null)
                    throw new ArgumentException($"La película con ID {dto.IdPelicula.Value} no existe.");
                funcion.IdPelicula = dto.IdPelicula.Value;
            }

            // Validar sala si se proporciona
            if (dto.IdSala.HasValue)
            {
                var sala = await _context.Salas.FindAsync(dto.IdSala.Value);
                if (sala == null)
                    throw new ArgumentException($"La sala con ID {dto.IdSala.Value} no existe.");
                funcion.IdSala = dto.IdSala.Value;
            }

            if (dto.FechaHoraInicio.HasValue)
                funcion.FechaHoraInicio = dto.FechaHoraInicio.Value;

            if (dto.PrecioBase.HasValue)
                funcion.PrecioBase = dto.PrecioBase.Value;

            await _context.SaveChangesAsync();

            return await GetByIdAsync(funcion.IdFuncion);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var funcion = await _context.Funciones
                .Include(f => f.ButacasFuncions)
                .Include(f => f.DetalleReservas)
                .Include(f => f.DetallesCompras)
                .Include(f => f.FechasHorasEspeciales)
                .FirstOrDefaultAsync(f => f.IdFuncion == id);

            if (funcion == null) return false;

            // Verificar si hay relaciones que impidan la eliminación
            if (funcion.ButacasFuncions.Any() || funcion.DetalleReservas.Any() || 
                funcion.DetallesCompras.Any() || funcion.FechasHorasEspeciales.Any())
            {
                throw new InvalidOperationException(
                    "No se puede eliminar la función porque tiene butacas, reservas, compras o fechas especiales asociadas."
                );
            }

            _context.Funciones.Remove(funcion);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}

