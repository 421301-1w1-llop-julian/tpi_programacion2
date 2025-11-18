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

    public async Task<PeliculaVistaDTO> ObtenerPeliculaMasVistaAsync(FiltrosDashboardDTO filtros)
    {
        return await _dashboardRepository.ObtenerPeliculaMasVistaAsync(filtros);
    }

    public async Task<RespuestaPaginadaDTO<CompraDTO>> ObtenerComprasPaginadasAsync(FiltrosDashboardDTO filtros)
    {
        return await _dashboardRepository.ObtenerComprasPaginadasAsync(filtros);
    }
}

