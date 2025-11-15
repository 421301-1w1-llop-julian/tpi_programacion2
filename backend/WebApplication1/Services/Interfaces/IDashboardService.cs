using WebApplication1.DTOs.Dashboard;

namespace WebApplication1.Services.Interfaces;

public interface IDashboardService
{
    Task<DashboardDTO> ObtenerDashboardAsync(FiltrosDashboardDTO filtros);
    Task<List<PeliculaVistaDTO>> ObtenerPeliculasMasVistasAsync(int? top = null, DateTime? fechaDesde = null, DateTime? fechaHasta = null);
    Task<RespuestaPaginadaDTO<CompraDTO>> ObtenerComprasPaginadasAsync(FiltrosDashboardDTO filtros);
}

