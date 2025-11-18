using WebApplication1.DTOs.Dashboard;

namespace WebApplication1.Services.Interfaces;

public interface IDashboardService
{
    Task<DashboardDTO> ObtenerDashboardAsync(FiltrosDashboardDTO filtros);
    Task<PeliculaVistaDTO> ObtenerPeliculaMasVistaAsync(FiltrosDashboardDTO filtros);
    Task<RespuestaPaginadaDTO<CompraDTO>> ObtenerComprasPaginadasAsync(FiltrosDashboardDTO filtros);
}

