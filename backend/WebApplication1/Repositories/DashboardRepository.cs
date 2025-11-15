using Microsoft.EntityFrameworkCore;
using WebApplication1.DTOs.Dashboard;
using WebApplication1.Models;
using WebApplication1.Repositories.Interfaces;

namespace WebApplication1.Repositories;

public class DashboardRepository : IDashboardRepository
{
    private readonly CINE_2025_1W1_GRUPO_5Context _context;

    public DashboardRepository(CINE_2025_1W1_GRUPO_5Context context)
    {
        _context = context;
    }

    public async Task<DashboardDTO> ObtenerDashboardAsync(FiltrosDashboardDTO filtros)
    {
        var dashboard = new DashboardDTO();

        // Obtener estadísticas generales
        dashboard.TotalReservas = await ObtenerTotalReservasAsync(filtros);
        dashboard.TotalCompras = await ObtenerTotalComprasAsync(filtros);
        dashboard.TotalFunciones = await ObtenerTotalFuncionesAsync(filtros);
        dashboard.TotalPeliculas = await _context.Peliculas.CountAsync();
        dashboard.IngresosTotales = await ObtenerIngresosTotalesAsync(filtros);

        // Obtener películas más vistas
        int top = filtros.TopPeliculas ?? 10;
        dashboard.PeliculasMasVistas = await ObtenerPeliculasMasVistasAsync(top, filtros.FechaDesde, filtros.FechaHasta);

        // Si solo se piden películas más vistas, no cargar otros datos
        if (filtros.SoloPeliculasMasVistas == true)
        {
            return dashboard;
        }

        // Obtener listas detalladas
        dashboard.Reservas = await ObtenerReservasAsync(filtros);
        dashboard.Compras = await ObtenerComprasAsync(filtros);
        dashboard.Funciones = await ObtenerFuncionesAsync(filtros);

        return dashboard;
    }

    public async Task<List<PeliculaVistaDTO>> ObtenerPeliculasMasVistasAsync(int? top = null, DateTime? fechaDesde = null, DateTime? fechaHasta = null)
    {
        var queryReservas = _context.DetalleReservas
            .Include(dr => dr.IdReservaNavigation)
            .Include(dr => dr.IdFuncionNavigation)
                .ThenInclude(f => f.IdPeliculaNavigation)
            .AsQueryable();

        var queryCompras = _context.DetallesCompras
            .Include(dc => dc.IdCompraNavigation)
            .Include(dc => dc.IdFuncionNavigation)
                .ThenInclude(f => f.IdPeliculaNavigation)
            .AsQueryable();

        if (fechaDesde.HasValue)
        {
            queryReservas = queryReservas.Where(dr => dr.IdReservaNavigation.FechaHoraReserva >= fechaDesde.Value);
            queryCompras = queryCompras.Where(dc => dc.IdCompraNavigation.FechaCompra >= fechaDesde.Value);
        }

        if (fechaHasta.HasValue)
        {
            queryReservas = queryReservas.Where(dr => dr.IdReservaNavigation.FechaHoraReserva <= fechaHasta.Value);
            queryCompras = queryCompras.Where(dc => dc.IdCompraNavigation.FechaCompra <= fechaHasta.Value);
        }

        // Agrupar por película desde reservas
        var reservasPorPelicula = await queryReservas
            .Where(dr => dr.IdFuncionNavigation != null && dr.IdFuncionNavigation.IdPeliculaNavigation != null)
            .GroupBy(dr => new { dr.IdFuncionNavigation.IdPelicula, dr.IdFuncionNavigation.IdPeliculaNavigation.Nombre })
            .Select(g => new
            {
                IdPelicula = g.Key.IdPelicula,
                Nombre = g.Key.Nombre,
                TotalReservas = g.Count()
            })
            .ToListAsync();

        // Agrupar por película desde compras
        var comprasPorPelicula = await queryCompras
            .Where(dc => dc.IdFuncion != null && dc.IdFuncionNavigation != null && dc.IdFuncionNavigation.IdPeliculaNavigation != null)
            .GroupBy(dc => new { dc.IdFuncionNavigation.IdPelicula, dc.IdFuncionNavigation.IdPeliculaNavigation.Nombre })
            .Select(g => new
            {
                IdPelicula = g.Key.IdPelicula,
                Nombre = g.Key.Nombre,
                TotalCompras = g.Sum(dc => dc.Cantidad),
                Ingresos = g.Sum(dc => dc.PrecioUnitario * dc.Cantidad)
            })
            .ToListAsync();

        // Combinar resultados
        var peliculasDict = new Dictionary<int, PeliculaVistaDTO>();

        foreach (var r in reservasPorPelicula)
        {
            if (!peliculasDict.ContainsKey(r.IdPelicula))
            {
                peliculasDict[r.IdPelicula] = new PeliculaVistaDTO
                {
                    IdPelicula = r.IdPelicula,
                    Nombre = r.Nombre,
                    TotalReservas = 0,
                    TotalCompras = 0,
                    IngresosTotales = 0
                };
            }
            peliculasDict[r.IdPelicula].TotalReservas = r.TotalReservas;
        }

        foreach (var c in comprasPorPelicula)
        {
            if (!peliculasDict.ContainsKey(c.IdPelicula))
            {
                peliculasDict[c.IdPelicula] = new PeliculaVistaDTO
                {
                    IdPelicula = c.IdPelicula,
                    Nombre = c.Nombre,
                    TotalReservas = 0,
                    TotalCompras = 0,
                    IngresosTotales = 0
                };
            }
            peliculasDict[c.IdPelicula].TotalCompras = c.TotalCompras;
            peliculasDict[c.IdPelicula].IngresosTotales = c.Ingresos;
        }

        // Calcular total de vistas (reservas + compras)
        foreach (var pelicula in peliculasDict.Values)
        {
            pelicula.TotalVistas = pelicula.TotalReservas + pelicula.TotalCompras;
        }

        var resultado = peliculasDict.Values
            .OrderByDescending(p => p.TotalVistas)
            .ToList();

        if (top.HasValue)
        {
            resultado = resultado.Take(top.Value).ToList();
        }

        return resultado;
    }

    public async Task<List<ReservaDTO>> ObtenerReservasAsync(FiltrosDashboardDTO filtros)
    {
        var query = _context.Reservas
            .Include(r => r.IdClienteNavigation)
            .Include(r => r.IdEstadoReservaNavigation)
            .Include(r => r.DetalleReservas)
                .ThenInclude(dr => dr.IdFuncionNavigation)
                    .ThenInclude(f => f.IdPeliculaNavigation)
            .AsQueryable();

        if (filtros.FechaDesde.HasValue)
        {
            query = query.Where(r => r.FechaHoraReserva >= filtros.FechaDesde.Value);
        }

        if (filtros.FechaHasta.HasValue)
        {
            query = query.Where(r => r.FechaHoraReserva <= filtros.FechaHasta.Value);
        }

        if (filtros.IdCliente.HasValue)
        {
            query = query.Where(r => r.IdCliente == filtros.IdCliente.Value);
        }

        if (filtros.IdPelicula.HasValue)
        {
            query = query.Where(r => r.DetalleReservas.Any(dr => dr.IdFuncionNavigation.IdPelicula == filtros.IdPelicula.Value));
        }

        var reservas = await query.ToListAsync();

        return reservas.Select(r => new ReservaDTO
        {
            IdReserva = r.IdReserva,
            IdCliente = r.IdCliente,
            NombreCliente = r.IdClienteNavigation != null 
                ? $"{r.IdClienteNavigation.Nombre} {r.IdClienteNavigation.Apellido}".Trim()
                : "N/A",
            FechaHoraReserva = r.FechaHoraReserva,
            FechaHoraVencimiento = r.FechaHoraVencimiento,
            EstadoReserva = r.IdEstadoReservaNavigation?.Nombre ?? "N/A",
            Pelicula = r.DetalleReservas.FirstOrDefault()?.IdFuncionNavigation?.IdPeliculaNavigation?.Nombre ?? "N/A",
            CantidadButacas = r.DetalleReservas.Count
        }).ToList();
    }

    public async Task<List<CompraDTO>> ObtenerComprasAsync(FiltrosDashboardDTO filtros)
    {
        var query = _context.Compras
            .Include(c => c.IdClienteNavigation)
            .Include(c => c.IdFormaPagoNavigation)
            .Include(c => c.DetallesCompras)
                .ThenInclude(dc => dc.IdFuncionNavigation)
                    .ThenInclude(f => f.IdPeliculaNavigation)
            .AsQueryable();

        if (filtros.FechaDesde.HasValue)
        {
            query = query.Where(c => c.FechaCompra >= filtros.FechaDesde.Value);
        }

        if (filtros.FechaHasta.HasValue)
        {
            query = query.Where(c => c.FechaCompra <= filtros.FechaHasta.Value);
        }

        if (filtros.IdCliente.HasValue)
        {
            query = query.Where(c => c.IdCliente == filtros.IdCliente.Value);
        }

        if (filtros.IdPelicula.HasValue)
        {
            query = query.Where(c => c.DetallesCompras.Any(dc => dc.IdFuncionNavigation != null && dc.IdFuncionNavigation.IdPelicula == filtros.IdPelicula.Value));
        }

        var compras = await query.ToListAsync();

        return compras.Select(c => new CompraDTO
        {
            IdCompra = c.IdCompra,
            IdCliente = c.IdCliente,
            NombreCliente = c.IdClienteNavigation != null 
                ? $"{c.IdClienteNavigation.Nombre} {c.IdClienteNavigation.Apellido}".Trim()
                : "N/A",
            FechaCompra = c.FechaCompra,
            FormaPago = c.IdFormaPagoNavigation?.Descripcion ?? "N/A",
            Estado = c.Estado,
            Total = c.DetallesCompras.Sum(dc => dc.PrecioUnitario * dc.Cantidad),
            Pelicula = c.DetallesCompras.FirstOrDefault(dc => dc.IdFuncionNavigation != null)?.IdFuncionNavigation?.IdPeliculaNavigation?.Nombre ?? "N/A"
        }).ToList();
    }

    public async Task<RespuestaPaginadaDTO<CompraDTO>> ObtenerComprasPaginadasAsync(FiltrosDashboardDTO filtros)
    {
        var query = _context.Compras
            .Include(c => c.IdClienteNavigation)
            .Include(c => c.IdFormaPagoNavigation)
            .Include(c => c.DetallesCompras)
                .ThenInclude(dc => dc.IdFuncionNavigation)
                    .ThenInclude(f => f.IdPeliculaNavigation)
            .AsQueryable();

        if (filtros.FechaDesde.HasValue)
        {
            query = query.Where(c => c.FechaCompra >= filtros.FechaDesde.Value);
        }

        if (filtros.FechaHasta.HasValue)
        {
            query = query.Where(c => c.FechaCompra <= filtros.FechaHasta.Value);
        }

        if (filtros.IdCliente.HasValue)
        {
            query = query.Where(c => c.IdCliente == filtros.IdCliente.Value);
        }

        if (filtros.IdPelicula.HasValue)
        {
            query = query.Where(c => c.DetallesCompras.Any(dc => dc.IdFuncionNavigation != null && dc.IdFuncionNavigation.IdPelicula == filtros.IdPelicula.Value));
        }

        // Aplicar filtros de monto basándose en el total de la compra
        // Primero necesitamos calcular el total para cada compra y luego filtrar
        // Para hacer esto eficientemente, primero obtenemos todas las compras que cumplen los otros filtros
        var comprasConTotales = await query.ToListAsync();
        
        // Calcular el total para cada compra y aplicar filtros de monto
        var comprasConTotalesCalculados = comprasConTotales
            .Select(c => new
            {
                Compra = c,
                Total = c.DetallesCompras.Sum(dc => dc.PrecioUnitario * dc.Cantidad)
            })
            .ToList();
        
        // Debug: Verificar que los filtros se están recibiendo
        // Console.WriteLine($"MontoMinimo: {filtros.MontoMinimo}, MontoMaximo: {filtros.MontoMaximo}");
        
        // Aplicar filtros de monto
        var comprasFiltradas = comprasConTotalesCalculados
            .Where(x => 
            {
                bool cumpleMinimo = !filtros.MontoMinimo.HasValue || x.Total >= filtros.MontoMinimo.Value;
                bool cumpleMaximo = !filtros.MontoMaximo.HasValue || x.Total <= filtros.MontoMaximo.Value;
                return cumpleMinimo && cumpleMaximo;
            })
            .Select(x => x.Compra)
            .OrderByDescending(c => c.FechaCompra)
            .ToList();

        // Obtener total de registros después de aplicar todos los filtros
        var totalRegistros = comprasFiltradas.Count;

        // Aplicar paginación
        int pagina = filtros.Pagina ?? 1;
        int tamañoPagina = filtros.TamañoPagina ?? 10;
        
        // Calcular total de páginas
        var totalPaginas = totalRegistros > 0 ? (int)Math.Ceiling(totalRegistros / (double)tamañoPagina) : 1;
        
        // Validar que la página solicitada no exceda el total de páginas
        if (pagina > totalPaginas && totalPaginas > 0)
        {
            pagina = totalPaginas;
        }
        if (pagina < 1)
        {
            pagina = 1;
        }
        
        // Aplicar paginación: Skip y Take deben aplicarse ANTES de convertir a lista
        var comprasPaginadas = comprasFiltradas
            .Skip((pagina - 1) * tamañoPagina)
            .Take(tamañoPagina)
            .ToList();
        
        // Verificar que la paginación se aplicó correctamente
        // Si comprasPaginadas.Count > tamañoPagina, hay un problema

        var comprasDTO = comprasPaginadas.Select(c => new CompraDTO
        {
            IdCompra = c.IdCompra,
            IdCliente = c.IdCliente,
            NombreCliente = c.IdClienteNavigation != null 
                ? $"{c.IdClienteNavigation.Nombre} {c.IdClienteNavigation.Apellido}".Trim()
                : "N/A",
            FechaCompra = c.FechaCompra,
            FormaPago = c.IdFormaPagoNavigation?.Descripcion ?? "N/A",
            Estado = c.Estado,
            Total = c.DetallesCompras.Sum(dc => dc.PrecioUnitario * dc.Cantidad),
            Pelicula = c.DetallesCompras.FirstOrDefault(dc => dc.IdFuncionNavigation != null)?.IdFuncionNavigation?.IdPeliculaNavigation?.Nombre ?? "N/A"
        }).ToList();

        return new RespuestaPaginadaDTO<CompraDTO>
        {
            Datos = comprasDTO,
            PaginaActual = pagina,
            TamañoPagina = tamañoPagina,
            TotalPaginas = totalPaginas,
            TotalRegistros = totalRegistros
        };
    }

    public async Task<List<FuncionDTO>> ObtenerFuncionesAsync(FiltrosDashboardDTO filtros)
    {
        var query = _context.Funciones
            .Include(f => f.IdPeliculaNavigation)
            .Include(f => f.IdSalaNavigation)
            .Include(f => f.ButacasFuncions)
            .AsQueryable();

        if (filtros.FechaDesde.HasValue)
        {
            query = query.Where(f => f.FechaHoraInicio >= filtros.FechaDesde.Value);
        }

        if (filtros.FechaHasta.HasValue)
        {
            query = query.Where(f => f.FechaHoraInicio <= filtros.FechaHasta.Value);
        }

        if (filtros.IdPelicula.HasValue)
        {
            query = query.Where(f => f.IdPelicula == filtros.IdPelicula.Value);
        }

        if (filtros.IdSala.HasValue)
        {
            query = query.Where(f => f.IdSala == filtros.IdSala.Value);
        }

        var funciones = await query.ToListAsync();

        return funciones.Select(f => new FuncionDTO
        {
            IdFuncion = f.IdFuncion,
            Pelicula = f.IdPeliculaNavigation?.Nombre ?? "N/A",
            Sala = f.IdSalaNavigation != null 
                ? $"Sala {f.IdSalaNavigation.NumeroSala}"
                : "N/A",
            FechaHoraInicio = f.FechaHoraInicio,
            PrecioBase = f.PrecioBase,
            ButacasOcupadas = f.ButacasFuncions.Count(bf => bf.IdEstadoButaca != 1), // 1 = Libre
            ButacasDisponibles = f.ButacasFuncions.Count(bf => bf.IdEstadoButaca == 1)
        }).ToList();
    }

    private async Task<int> ObtenerTotalReservasAsync(FiltrosDashboardDTO filtros)
    {
        IQueryable<Reserva> query = _context.Reservas;

        if (filtros.IdPelicula.HasValue)
        {
            query = _context.Reservas
                .Include(r => r.DetalleReservas)
                .ThenInclude(dr => dr.IdFuncionNavigation)
                .AsQueryable();
        }

        if (filtros.FechaDesde.HasValue)
        {
            query = query.Where(r => r.FechaHoraReserva >= filtros.FechaDesde.Value);
        }

        if (filtros.FechaHasta.HasValue)
        {
            query = query.Where(r => r.FechaHoraReserva <= filtros.FechaHasta.Value);
        }

        if (filtros.IdCliente.HasValue)
        {
            query = query.Where(r => r.IdCliente == filtros.IdCliente.Value);
        }

        if (filtros.IdPelicula.HasValue)
        {
            query = query.Where(r => r.DetalleReservas.Any(dr => dr.IdFuncionNavigation.IdPelicula == filtros.IdPelicula.Value));
        }

        return await query.CountAsync();
    }

    private async Task<int> ObtenerTotalComprasAsync(FiltrosDashboardDTO filtros)
    {
        IQueryable<Compra> query = _context.Compras;

        if (filtros.IdPelicula.HasValue)
        {
            query = _context.Compras
                .Include(c => c.DetallesCompras)
                .ThenInclude(dc => dc.IdFuncionNavigation)
                .AsQueryable();
        }

        if (filtros.FechaDesde.HasValue)
        {
            query = query.Where(c => c.FechaCompra >= filtros.FechaDesde.Value);
        }

        if (filtros.FechaHasta.HasValue)
        {
            query = query.Where(c => c.FechaCompra <= filtros.FechaHasta.Value);
        }

        if (filtros.IdCliente.HasValue)
        {
            query = query.Where(c => c.IdCliente == filtros.IdCliente.Value);
        }

        if (filtros.IdPelicula.HasValue)
        {
            query = query.Where(c => c.DetallesCompras.Any(dc => dc.IdFuncionNavigation != null && dc.IdFuncionNavigation.IdPelicula == filtros.IdPelicula.Value));
        }

        return await query.CountAsync();
    }

    private async Task<int> ObtenerTotalFuncionesAsync(FiltrosDashboardDTO filtros)
    {
        var query = _context.Funciones.AsQueryable();

        if (filtros.FechaDesde.HasValue)
        {
            query = query.Where(f => f.FechaHoraInicio >= filtros.FechaDesde.Value);
        }

        if (filtros.FechaHasta.HasValue)
        {
            query = query.Where(f => f.FechaHoraInicio <= filtros.FechaHasta.Value);
        }

        if (filtros.IdPelicula.HasValue)
        {
            query = query.Where(f => f.IdPelicula == filtros.IdPelicula.Value);
        }

        if (filtros.IdSala.HasValue)
        {
            query = query.Where(f => f.IdSala == filtros.IdSala.Value);
        }

        return await query.CountAsync();
    }

    private async Task<decimal> ObtenerIngresosTotalesAsync(FiltrosDashboardDTO filtros)
    {
        IQueryable<DetallesCompra> queryable = _context.DetallesCompras
            .Include(dc => dc.IdCompraNavigation);

        if (filtros.IdPelicula.HasValue)
        {
            queryable = queryable.Include(dc => dc.IdFuncionNavigation);
        }

        if (filtros.FechaDesde.HasValue)
        {
            queryable = queryable.Where(dc => dc.IdCompraNavigation.FechaCompra >= filtros.FechaDesde.Value);
        }

        if (filtros.FechaHasta.HasValue)
        {
            queryable = queryable.Where(dc => dc.IdCompraNavigation.FechaCompra <= filtros.FechaHasta.Value);
        }

        if (filtros.IdCliente.HasValue)
        {
            queryable = queryable.Where(dc => dc.IdCompraNavigation.IdCliente == filtros.IdCliente.Value);
        }

        if (filtros.IdPelicula.HasValue)
        {
            queryable = queryable.Where(dc => dc.IdFuncionNavigation != null && dc.IdFuncionNavigation.IdPelicula == filtros.IdPelicula.Value);
        }

        return await queryable.SumAsync(dc => dc.PrecioUnitario * dc.Cantidad);
    }
}

