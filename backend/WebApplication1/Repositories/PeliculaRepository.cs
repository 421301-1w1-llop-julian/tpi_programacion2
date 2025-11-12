using WebApplication1.DTOs.Pelicula;
using WebApplication1.Models;
using WebApplication1.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace WebApplication1.Repositories
{
    public class PeliculaRepository : IPeliculaRepository
    {
        private readonly CINE_2025_1W1_GRUPO_5Context _context;

        public PeliculaRepository(CINE_2025_1W1_GRUPO_5Context context)
        {
            _context = context;
        }

        public async Task<IEnumerable<PeliculaListDTO>> GetAllAsync(PeliculaFilterDTO? filters = null)
        {
            var query = _context.Peliculas
                .Include(p => p.IdClasificacionNavigation)
                .Include(p => p.IdPaisNavigation)
                .Include(p => p.PeliculasGeneros)
                .Include(p => p.PeliculasIdiomas)
                .AsQueryable();

            if (filters != null)
            {
                if (!string.IsNullOrWhiteSpace(filters.Search))
                {
                    var search = filters.Search.Trim();
                    query = query.Where(p => p.Nombre.Contains(search) || p.Descripcion.Contains(search));
                }

                if (filters.GeneroId.HasValue)
                {
                    var genId = filters.GeneroId.Value;
                    query = query.Where(p => p.PeliculasGeneros.Any(pg => pg.IdGenero == genId));
                }

                if (filters.IdiomaId.HasValue)
                {
                    var idiomaId = filters.IdiomaId.Value;
                    query = query.Where(p => p.PeliculasIdiomas.Any(pi => pi.IdIdioma == idiomaId));
                }

                if (filters.ClasificacionId.HasValue)
                {
                    var clasId = filters.ClasificacionId.Value;
                    query = query.Where(p => p.IdClasificacion == clasId);
                }

                if (filters.TipoPublicoId.HasValue)
                {
                    var tpId = filters.TipoPublicoId.Value;
                    query = query.Where(p => p.IdTipoPublico == tpId);
                }

                if (filters.MinDuration.HasValue)
                {
                    var minDur = filters.MinDuration.Value;
                    query = query.Where(p => p.Duracion >= minDur);
                }
            }

            return await query
                .Select(p => new PeliculaListDTO
                {
                    IdPelicula = p.IdPelicula,
                    Nombre = p.Nombre,
                    Descripcion = p.Descripcion,
                    Imagen = p.Imagen,
                    IdClasificacion = p.IdClasificacion,
                    Clasificacion = p.IdClasificacionNavigation.Nombre,
                    IdTipoPublico = p.IdTipoPublico,
                    Duracion = p.Duracion,
                    Pais = p.IdPaisNavigation.Nombre,
                    FechaEstreno = p.FechaEstreno,
                    GeneroIds = p.PeliculasGeneros.Select(pg => pg.IdGenero).ToList(),
                    IdiomaIds = p.PeliculasIdiomas.Select(pi => pi.IdIdioma).ToList()
                })
                .ToListAsync();
        }

        public async Task<PeliculaDTO> GetByIdAsync(int id)
        {
            var pelicula = await _context.Peliculas
                .Include(p => p.IdClasificacionNavigation)
                .Include(p => p.IdPaisNavigation)
                .Include(p => p.IdDistribuidoraNavigation)
                .Include(p => p.IdTipoPublicoNavigation)
                .Include(p => p.PeliculasGeneros).ThenInclude(pg => pg.IdGeneroNavigation)
                .Include(p => p.PeliculasIdiomas).ThenInclude(pi => pi.IdIdiomaNavigation)
                .Include(p => p.PeliculasActores).ThenInclude(pa => pa.IdActorNavigation)
                .Include(p => p.PeliculasDirectores).ThenInclude(pd => pd.IdDirectorNavigation)
                .FirstOrDefaultAsync(p => p.IdPelicula == id);

            if (pelicula == null) return null;

            return new PeliculaDTO
            {
                IdPelicula = pelicula.IdPelicula,
                Nombre = pelicula.Nombre,
                Descripcion = pelicula.Descripcion,
                Imagen = pelicula.Imagen,
                Duracion = pelicula.Duracion,
                FechaEstreno = pelicula.FechaEstreno,
                IdClasificacion = pelicula.IdClasificacion,
                Clasificacion = pelicula.IdClasificacionNavigation?.Nombre,
                IdPais = pelicula.IdPais,
                Pais = pelicula.IdPaisNavigation?.Nombre,
                IdDistribuidora = pelicula.IdDistribuidora,
                Distribuidora = pelicula.IdDistribuidoraNavigation?.Nombre,
                IdTipoPublico = pelicula.IdTipoPublico,
                TipoPublico = pelicula.IdTipoPublicoNavigation?.Nombre,
                Generos = pelicula.PeliculasGeneros.Select(pg => pg.IdGeneroNavigation.Nombre).ToList(),
                Idiomas = pelicula.PeliculasIdiomas.Select(pi => pi.IdIdiomaNavigation.Nombre).ToList(),
                Actores = pelicula.PeliculasActores
                    .Select(pa => pa.IdActorNavigation.Nombre + " " + pa.IdActorNavigation.Apellido)
                    .ToList(),
                Directores = pelicula.PeliculasDirectores
                    .Select(pd => pd.IdDirectorNavigation.Nombre + " " + pd.IdDirectorNavigation.Apellido)
                    .ToList()
            };
        }


        public async Task<PeliculaDTO> CreateAsync(PeliculaCreateDTO dto)
        {
            var pelicula = new Pelicula
            {
                Nombre = dto.Nombre,
                Descripcion = dto.Descripcion,
                Imagen = dto.Imagen,
                Duracion = dto.Duracion,
                FechaEstreno = dto.FechaEstreno,
                IdClasificacion = dto.IdClasificacion,
                IdPais = dto.IdPais,
                IdDistribuidora = dto.IdDistribuidora,
                IdTipoPublico = dto.IdTipoPublico
            };

            _context.Peliculas.Add(pelicula);
            await _context.SaveChangesAsync();

            // Relaciones opcionales
            if (dto.GeneroIds != null)
                foreach (var id in dto.GeneroIds)
                    _context.PeliculasGeneros.Add(new PeliculasGenero { IdPelicula = pelicula.IdPelicula, IdGenero = id });

            if (dto.IdiomaIds != null)
                foreach (var id in dto.IdiomaIds)
                    _context.PeliculasIdiomas.Add(new PeliculasIdioma { IdPelicula = pelicula.IdPelicula, IdIdioma = id });

            if (dto.ActorIds != null)
                foreach (var id in dto.ActorIds)
                    _context.PeliculasActores.Add(new PeliculasActor { IdPelicula = pelicula.IdPelicula, IdActor = id });

            if (dto.DirectorIds != null)
                foreach (var id in dto.DirectorIds)
                    _context.PeliculasDirectores.Add(new PeliculasDirector { IdPelicula = pelicula.IdPelicula, IdDirector = id });

            await _context.SaveChangesAsync();

            return await GetByIdAsync(pelicula.IdPelicula);
        }

        public async Task<PeliculaDTO> UpdateAsync(PeliculaUpdateDTO dto)
        {
            var pelicula = await _context.Peliculas
                .Include(p => p.PeliculasActores)
                .Include(p => p.PeliculasDirectores)
                .Include(p => p.PeliculasGeneros)
                .Include(p => p.PeliculasIdiomas)
                .FirstOrDefaultAsync(p => p.IdPelicula == dto.IdPelicula);

            if (pelicula == null) return null;

            if (dto.Nombre != null) pelicula.Nombre = dto.Nombre;
            if (dto.Descripcion != null) pelicula.Descripcion = dto.Descripcion;
            if (dto.Duracion.HasValue) pelicula.Duracion = dto.Duracion.Value;
            if (dto.FechaEstreno.HasValue) pelicula.FechaEstreno = dto.FechaEstreno;
            if (dto.IdClasificacion.HasValue) pelicula.IdClasificacion = dto.IdClasificacion.Value;
            if (dto.IdPais.HasValue) pelicula.IdPais = dto.IdPais.Value;
            if (dto.IdDistribuidora.HasValue) pelicula.IdDistribuidora = dto.IdDistribuidora.Value;
            if (dto.IdTipoPublico.HasValue) pelicula.IdTipoPublico = dto.IdTipoPublico.Value;

            // Actualizar relaciones
            if (dto.GeneroIds != null)
            {
                _context.PeliculasGeneros.RemoveRange(pelicula.PeliculasGeneros);
                foreach (var id in dto.GeneroIds)
                    _context.PeliculasGeneros.Add(new PeliculasGenero { IdPelicula = pelicula.IdPelicula, IdGenero = id });
            }

            if (dto.IdiomaIds != null)
            {
                _context.PeliculasIdiomas.RemoveRange(pelicula.PeliculasIdiomas);
                foreach (var id in dto.IdiomaIds)
                    _context.PeliculasIdiomas.Add(new PeliculasIdioma { IdPelicula = pelicula.IdPelicula, IdIdioma = id });
            }

            if (dto.ActorIds != null)
            {
                _context.PeliculasActores.RemoveRange(pelicula.PeliculasActores);
                foreach (var id in dto.ActorIds)
                    _context.PeliculasActores.Add(new PeliculasActor { IdPelicula = pelicula.IdPelicula, IdActor = id });
            }

            if (dto.DirectorIds != null)
            {
                _context.PeliculasDirectores.RemoveRange(pelicula.PeliculasDirectores);
                foreach (var id in dto.DirectorIds)
                    _context.PeliculasDirectores.Add(new PeliculasDirector { IdPelicula = pelicula.IdPelicula, IdDirector = id });
            }

            await _context.SaveChangesAsync();
            return await GetByIdAsync(pelicula.IdPelicula);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var pelicula = await _context.Peliculas.FindAsync(id);
            if (pelicula == null) return false;

            _context.Peliculas.Remove(pelicula);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
