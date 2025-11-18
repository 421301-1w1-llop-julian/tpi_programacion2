using WebApplication1.DTOs.Dashboard;

namespace WebApplication1.Repositories.Interfaces;

public interface IDashboardRepository
{
    Task<DashboardDTO> ObtenerDashboardAsync(FiltrosDashboardDTO filtros);
    Task<PeliculaVistaDTO> ObtenerPeliculaMasVistaAsync(FiltrosDashboardDTO filtros);
    Task<List<ReservaDTO>> ObtenerReservasAsync(FiltrosDashboardDTO filtros);
    Task<List<CompraDTO>> ObtenerComprasAsync(FiltrosDashboardDTO filtros);
    Task<RespuestaPaginadaDTO<CompraDTO>> ObtenerComprasPaginadasAsync(FiltrosDashboardDTO filtros);
    Task<List<FuncionDTO>> ObtenerFuncionesAsync(FiltrosDashboardDTO filtros);
}

