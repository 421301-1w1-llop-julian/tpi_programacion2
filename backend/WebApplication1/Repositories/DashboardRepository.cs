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
        dashboard.IngresosTotales = await ObtenerIngresosTotalesAsync(filtros);
        dashboard.PeliculaMasVista = await ObtenerPeliculaMasVistaAsync(filtros);
        dashboard.EntradasVendidas = await ObtenerTotalEntradasVendidasAsync(filtros);
        dashboard.IngresoPromedioFuncion = await ObtenerIngresoPromedioPorFuncionAsync(filtros);

        return dashboard;
    }


    public async Task<PeliculaVistaDTO> ObtenerPeliculaMasVistaAsync(FiltrosDashboardDTO filtros)
    {
        var query = _context.DetallesCompras
            .Include(dc => dc.IdCompraNavigation)
            .Include(dc => dc.IdFuncionNavigation)
                .ThenInclude(f => f.IdPeliculaNavigation)
            .Where(dc => dc.IdFuncionNavigation != null)
            .AsQueryable();

        // --- Mismos filtros que ObtenerComprasPaginadasAsync ---

        if (filtros.FechaDesde.HasValue)
            query = query.Where(dc =>
                dc.IdCompraNavigation.FechaCompra >= filtros.FechaDesde.Value);

        if (filtros.FechaHasta.HasValue)
            query = query.Where(dc =>
                dc.IdCompraNavigation.FechaCompra <= filtros.FechaHasta.Value);

        if (filtros.IdCliente.HasValue)
            query = query.Where(dc =>
                dc.IdCompraNavigation.IdCliente == filtros.IdCliente.Value);

        if (filtros.IdPelicula.HasValue)
            query = query.Where(dc =>
                dc.IdFuncionNavigation.IdPelicula == filtros.IdPelicula.Value);

        // --- Filtro por monto requiere agrupar por compra ---
        if (filtros.MontoMinimo.HasValue || filtros.MontoMaximo.HasValue)
        {
            query =
                from dc in query
                where (
                    from dc2 in _context.DetallesCompras
                    where dc2.IdCompra == dc.IdCompra
                    group dc2 by dc2.IdCompra into g
                    where (!filtros.MontoMinimo.HasValue
                            || g.Sum(x => x.PrecioUnitario * x.Cantidad) >= filtros.MontoMinimo.Value)
                       && (!filtros.MontoMaximo.HasValue
                            || g.Sum(x => x.PrecioUnitario * x.Cantidad) <= filtros.MontoMaximo.Value)
                    select g.Key
                ).Contains(dc.IdCompra)
                select dc;
        }

        // --- Agrupar por película y obtener solo la más vista ---
        var pelicula = await query
            .GroupBy(dc => new
            {
                dc.IdFuncionNavigation.IdPelicula,
                dc.IdFuncionNavigation.IdPeliculaNavigation.Nombre
            })
            .Select(g => new PeliculaVistaDTO
            {
                IdPelicula = g.Key.IdPelicula,
                Nombre = g.Key.Nombre,
                TotalCompras = g.Sum(dc => dc.Cantidad),
                IngresosTotales = g.Sum(dc => dc.PrecioUnitario * dc.Cantidad)
            })
            .OrderByDescending(p => p.TotalCompras)
            .FirstOrDefaultAsync();   // ⬅ SOLO UNA

        return pelicula ?? new PeliculaVistaDTO
        {
            IdPelicula = 0,
            Nombre = "N/A",
            TotalCompras = 0,
            IngresosTotales = 0
        };
    }


    public async Task<List<ReservaDTO>> ObtenerReservasAsync(FiltrosDashboardDTO filtros)
    {
        var query = _context
            .Reservas.Include(r => r.IdClienteNavigation)
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
            query = query.Where(r =>
                r.DetalleReservas.Any(dr =>
                    dr.IdFuncionNavigation.IdPelicula == filtros.IdPelicula.Value
                )
            );
        }

        var reservas = await query.ToListAsync();

        return reservas
            .Select(r => new ReservaDTO
            {
                IdReserva = r.IdReserva,
                IdCliente = r.IdCliente,
                NombreCliente =
                    r.IdClienteNavigation != null
                        ? $"{r.IdClienteNavigation.Nombre} {r.IdClienteNavigation.Apellido}".Trim()
                        : "N/A",
                FechaHoraReserva = r.FechaHoraReserva,
                FechaHoraVencimiento = r.FechaHoraVencimiento,
                EstadoReserva = r.IdEstadoReservaNavigation?.Nombre ?? "N/A",
                Pelicula =
                    r.DetalleReservas.FirstOrDefault()?.IdFuncionNavigation?.IdPeliculaNavigation?.Nombre
                    ?? "N/A",
                CantidadButacas = r.DetalleReservas.Count,
            })
            .ToList();
    }

    public async Task<List<CompraDTO>> ObtenerComprasAsync(FiltrosDashboardDTO filtros)
    {
        var query = _context
            .Compras.Include(c => c.IdClienteNavigation)
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
            query = query.Where(c =>
                c.DetallesCompras.Any(dc =>
                    dc.IdFuncionNavigation != null
                    && dc.IdFuncionNavigation.IdPelicula == filtros.IdPelicula.Value
                )
            );
        }

        var compras = await query.ToListAsync();

        return compras
            .Select(c => new CompraDTO
            {
                IdCompra = c.IdCompra,
                IdCliente = c.IdCliente,
                NombreCliente =
                    c.IdClienteNavigation != null
                        ? $"{c.IdClienteNavigation.Nombre} {c.IdClienteNavigation.Apellido}".Trim()
                        : "N/A",
                FechaCompra = c.FechaCompra,
                FormaPago = c.IdFormaPagoNavigation?.Descripcion ?? "N/A",
                Estado = c.Estado,
                Total = c.DetallesCompras.Sum(dc => dc.PrecioUnitario * dc.Cantidad),
                Pelicula =
                    c.DetallesCompras.FirstOrDefault(dc =>
                        dc.IdFuncionNavigation != null
                    )?.IdFuncionNavigation?.IdPeliculaNavigation?.Nombre
                    ?? "N/A",
            })
            .ToList();
    }

    public async Task<RespuestaPaginadaDTO<CompraDTO>> ObtenerComprasPaginadasAsync(
        FiltrosDashboardDTO filtros
    )
    {
        int pagina = filtros.Pagina ?? 1;
        int tamañoPagina = filtros.TamañoPagina ?? 10;

        var query = _context
            .Compras.Include(c => c.IdClienteNavigation)
            .Include(c => c.IdFormaPagoNavigation)
            .Include(c => c.DetallesCompras)
            .ThenInclude(dc => dc.IdFuncionNavigation)
            .ThenInclude(f => f.IdPeliculaNavigation)
            .AsQueryable();

        // --- Filtros SQL ---
        if (filtros.FechaDesde.HasValue)
            query = query.Where(c => c.FechaCompra >= filtros.FechaDesde.Value);

        if (filtros.FechaHasta.HasValue)
            query = query.Where(c => c.FechaCompra <= filtros.FechaHasta.Value);

        if (filtros.IdCliente.HasValue)
            query = query.Where(c => c.IdCliente == filtros.IdCliente.Value);

        if (filtros.IdPelicula.HasValue)
            query = query.Where(c =>
                c.DetallesCompras.Any(dc => dc.IdFuncionNavigation.IdPelicula == filtros.IdPelicula)
            );

        // Filtro de monto mediante agregación SQL
        if (filtros.MontoMinimo.HasValue)
            query = query.Where(c =>
                c.DetallesCompras.Sum(dc => dc.PrecioUnitario * dc.Cantidad)
                >= filtros.MontoMinimo.Value
            );

        if (filtros.MontoMaximo.HasValue)
            query = query.Where(c =>
                c.DetallesCompras.Sum(dc => dc.PrecioUnitario * dc.Cantidad)
                <= filtros.MontoMaximo.Value
            );

        // Total filtrado (SQL)
        int totalRegistros = await query.CountAsync();

        // Ordenamiento
        query = query.OrderByDescending(c => c.FechaCompra);

        // Paginación real en SQL
        var compras = await query
            .Skip((pagina - 1) * tamañoPagina)
            .Take(tamañoPagina)
            .ToListAsync();

        // Mapear DTOs
        var comprasDTO = compras
            .Select(c => new CompraDTO
            {
                IdCompra = c.IdCompra,
                IdCliente = c.IdCliente,
                NombreCliente =
                    c.IdClienteNavigation != null
                        ? $"{c.IdClienteNavigation.Nombre} {c.IdClienteNavigation.Apellido}".Trim()
                        : "N/A",
                FechaCompra = c.FechaCompra,
                FormaPago = c.IdFormaPagoNavigation?.Descripcion ?? "N/A",
                Estado = c.Estado,
                Total = c.DetallesCompras.Sum(dc => dc.PrecioUnitario * dc.Cantidad),
                Pelicula =
                    c.DetallesCompras.Select(dc =>
                            dc.IdFuncionNavigation?.IdPeliculaNavigation?.Nombre
                        )
                        .FirstOrDefault(nombre => nombre != null)
                    ?? "N/A", // si hay varias películas, toma la primera
            })
            .ToList();

        return new RespuestaPaginadaDTO<CompraDTO>
        {
            Datos = comprasDTO,
            PaginaActual = pagina,
            TamañoPagina = tamañoPagina,
            TotalPaginas = (int)Math.Ceiling(totalRegistros / (double)tamañoPagina),
            TotalRegistros = totalRegistros,
        };
    }

    public async Task<List<FuncionDTO>> ObtenerFuncionesAsync(FiltrosDashboardDTO filtros)
    {
        var query = _context
            .Funciones.Include(f => f.IdPeliculaNavigation)
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

        return funciones
            .Select(f => new FuncionDTO
            {
                IdFuncion = f.IdFuncion,
                Pelicula = f.IdPeliculaNavigation?.Nombre ?? "N/A",
                Sala = f.IdSalaNavigation != null ? $"Sala {f.IdSalaNavigation.NumeroSala}" : "N/A",
                FechaHoraInicio = f.FechaHoraInicio,
                PrecioBase = f.PrecioBase,
                ButacasOcupadas = f.ButacasFuncions.Count(bf => bf.IdEstadoButaca != 1), // 1 = Libre
                ButacasDisponibles = f.ButacasFuncions.Count(bf => bf.IdEstadoButaca == 1),
            })
            .ToList();
    }

    private async Task<int> ObtenerTotalReservasAsync(FiltrosDashboardDTO filtros)
    {
        IQueryable<Reserva> query = _context.Reservas;

        if (filtros.IdPelicula.HasValue)
        {
            query = _context
                .Reservas.Include(r => r.DetalleReservas)
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
            query = query.Where(r =>
                r.DetalleReservas.Any(dr =>
                    dr.IdFuncionNavigation.IdPelicula == filtros.IdPelicula.Value
                )
            );
        }

        return await query.CountAsync();
    }

    private async Task<decimal> ObtenerIngresosTotalesAsync(FiltrosDashboardDTO filtros)
    {
        var query = _context
            .Compras
            .Include(c => c.DetallesCompras)
            .ThenInclude(dc => dc.IdFuncionNavigation)
            .AsQueryable();

        // --- Filtros SQL ---
        if (filtros.FechaDesde.HasValue)
            query = query.Where(c => c.FechaCompra >= filtros.FechaDesde.Value);

        if (filtros.FechaHasta.HasValue)
            query = query.Where(c => c.FechaCompra <= filtros.FechaHasta.Value);

        if (filtros.IdCliente.HasValue)
            query = query.Where(c => c.IdCliente == filtros.IdCliente.Value);

        if (filtros.IdPelicula.HasValue)
            query = query.Where(c =>
                c.DetallesCompras.Any(dc =>
                    dc.IdFuncionNavigation.IdPelicula == filtros.IdPelicula
                )
            );

        if (filtros.MontoMinimo.HasValue)
            query = query.Where(c =>
                c.DetallesCompras.Sum(dc => dc.PrecioUnitario * dc.Cantidad)
                >= filtros.MontoMinimo.Value
            );

        if (filtros.MontoMaximo.HasValue)
            query = query.Where(c =>
                c.DetallesCompras.Sum(dc => dc.PrecioUnitario * dc.Cantidad)
                <= filtros.MontoMaximo.Value
            );

        // --- Cálculo del total recaudado ---
        var totalRecaudado = await query
            .SelectMany(c => c.DetallesCompras)
            .SumAsync(dc => dc.PrecioUnitario * dc.Cantidad);

        return totalRecaudado;
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

    private async Task<int> ObtenerTotalEntradasVendidasAsync(FiltrosDashboardDTO filtros)
    {
        var query = _context
            .Compras
            .Include(c => c.DetallesCompras)
            .ThenInclude(dc => dc.IdFuncionNavigation)
            .AsQueryable();

        // --- Filtros ---
        if (filtros.FechaDesde.HasValue)
            query = query.Where(c => c.FechaCompra >= filtros.FechaDesde.Value);

        if (filtros.FechaHasta.HasValue)
            query = query.Where(c => c.FechaCompra <= filtros.FechaHasta.Value);

        if (filtros.IdCliente.HasValue)
            query = query.Where(c => c.IdCliente == filtros.IdCliente.Value);

        if (filtros.IdPelicula.HasValue)
            query = query.Where(c =>
                c.DetallesCompras.Any(dc =>
                    dc.IdFuncionNavigation.IdPelicula == filtros.IdPelicula.Value
                )
            );

        if (filtros.MontoMinimo.HasValue)
            query = query.Where(c =>
                c.DetallesCompras.Sum(dc => dc.PrecioUnitario * dc.Cantidad)
                >= filtros.MontoMinimo.Value
            );

        if (filtros.MontoMaximo.HasValue)
            query = query.Where(c =>
                c.DetallesCompras.Sum(dc => dc.PrecioUnitario * dc.Cantidad)
                <= filtros.MontoMaximo.Value
            );

        // --- Total de entradas vendidas ---
        int totalEntradas = await query
            .SelectMany(c => c.DetallesCompras)
            .SumAsync(dc => dc.Cantidad);

        return totalEntradas;
    }

    private async Task<decimal> ObtenerIngresoPromedioPorFuncionAsync(FiltrosDashboardDTO filtros)
    {
        var query = _context
            .Compras
            .Include(c => c.DetallesCompras)
            .ThenInclude(dc => dc.IdFuncionNavigation)
            .AsQueryable();

        // --- Filtros ---
        if (filtros.FechaDesde.HasValue)
            query = query.Where(c => c.FechaCompra >= filtros.FechaDesde.Value);

        if (filtros.FechaHasta.HasValue)
            query = query.Where(c => c.FechaCompra <= filtros.FechaHasta.Value);

        if (filtros.IdCliente.HasValue)
            query = query.Where(c => c.IdCliente == filtros.IdCliente.Value);

        if (filtros.IdPelicula.HasValue)
            query = query.Where(c =>
                c.DetallesCompras.Any(dc =>
                    dc.IdFuncionNavigation.IdPelicula == filtros.IdPelicula.Value
                )
            );

        if (filtros.MontoMinimo.HasValue)
            query = query.Where(c =>
                c.DetallesCompras.Sum(dc => dc.PrecioUnitario * dc.Cantidad)
                >= filtros.MontoMinimo.Value
            );

        if (filtros.MontoMaximo.HasValue)
            query = query.Where(c =>
                c.DetallesCompras.Sum(dc => dc.PrecioUnitario * dc.Cantidad)
                <= filtros.MontoMaximo.Value
            );

        // --- Obtener detalles filtrados en una sola proyección ---
        var detallesQuery = query.SelectMany(c => c.DetallesCompras);

        // Total dinero
        decimal totalDinero = await detallesQuery
            .SumAsync(dc => dc.PrecioUnitario * dc.Cantidad);

        // Cantidad de funciones únicas
        int totalFunciones = await detallesQuery
            .Select(dc => dc.IdFuncion)
            .Distinct()
            .CountAsync();

        if (totalFunciones == 0)
            return 0;

        // Promedio por función
        return totalDinero / totalFunciones;
    }


}

