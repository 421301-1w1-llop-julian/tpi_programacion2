using WebApplication1.DTOs.Dashboard;
using WebApplication1.Repositories.Interfaces;
using WebApplication1.Services.Interfaces;

namespace WebApplication1.Services;

public class DashboardService : IDashboardService
{
    private readonly IDashboardRepository _dashboardRepository;

    public DashboardService(IDashboardRepository dashboardRepository)
    {
        _dashboardRepository = dashboardRepository;
    }

    public async Task<DashboardDTO> ObtenerDashboardAsync(FiltrosDashboardDTO filtros)
    {
        return await _dashboardRepository.ObtenerDashboardAsync(filtros);
    }

    public async Task<List<PeliculaVistaDTO>> ObtenerPeliculasMasVistasAsync(int? top = null, DateTime? fechaDesde = null, DateTime? fechaHasta = null)
    {
        return await _dashboardRepository.ObtenerPeliculasMasVistasAsync(top, fechaDesde, fechaHasta);
    }
}

