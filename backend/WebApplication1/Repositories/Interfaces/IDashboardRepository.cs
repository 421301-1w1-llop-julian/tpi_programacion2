using WebApplication1.DTOs.Dashboard;

namespace WebApplication1.Repositories.Interfaces;

public interface IDashboardRepository
{
    Task<DashboardDTO> ObtenerDashboardAsync(FiltrosDashboardDTO filtros);
    Task<List<PeliculaVistaDTO>> ObtenerPeliculasMasVistasAsync(int? top = null, DateTime? fechaDesde = null, DateTime? fechaHasta = null);
    Task<List<ReservaDTO>> ObtenerReservasAsync(FiltrosDashboardDTO filtros);
    Task<List<CompraDTO>> ObtenerComprasAsync(FiltrosDashboardDTO filtros);
    Task<List<FuncionDTO>> ObtenerFuncionesAsync(FiltrosDashboardDTO filtros);
}

