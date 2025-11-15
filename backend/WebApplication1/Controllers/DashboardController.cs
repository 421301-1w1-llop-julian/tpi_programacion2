using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApplication1.DTOs.Dashboard;
using WebApplication1.Services.Interfaces;

namespace WebApplication1.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "AdminOnly")]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    /// <summary>
    /// Obtiene todos los datos del dashboard con filtros opcionales
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> ObtenerDashboard([FromQuery] FiltrosDashboardDTO filtros)
    {
        try
        {
            var dashboard = await _dashboardService.ObtenerDashboardAsync(filtros);
            return Ok(dashboard);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Error al obtener el dashboard", message = ex.Message });
        }
    }

    /// <summary>
    /// Obtiene las películas más vistas con filtros opcionales
    /// </summary>
    [HttpGet("peliculas-mas-vistas")]
    public async Task<IActionResult> ObtenerPeliculasMasVistas(
        [FromQuery] int? top = null,
        [FromQuery] DateTime? fechaDesde = null,
        [FromQuery] DateTime? fechaHasta = null)
    {
        try
        {
            var peliculas = await _dashboardService.ObtenerPeliculasMasVistasAsync(top, fechaDesde, fechaHasta);
            return Ok(peliculas);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Error al obtener las películas más vistas", message = ex.Message });
        }
    }

    /// <summary>
    /// Obtiene todas las reservas con filtros opcionales
    /// </summary>
    [HttpGet("reservas")]
    public async Task<IActionResult> ObtenerReservas([FromQuery] FiltrosDashboardDTO filtros)
    {
        try
        {
            var dashboard = await _dashboardService.ObtenerDashboardAsync(filtros);
            return Ok(dashboard.Reservas);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Error al obtener las reservas", message = ex.Message });
        }
    }

    /// <summary>
    /// Obtiene todas las compras con filtros opcionales y paginación
    /// </summary>
    [HttpGet("compras")]
    public async Task<IActionResult> ObtenerCompras([FromQuery] FiltrosDashboardDTO filtros)
    {
        try
        {
            // Debug: Verificar que los filtros se están recibiendo
            // Los logs se pueden ver en la consola del servidor o en los logs de la aplicación
            
            // Si se solicita paginación, usar el método paginado
            if (filtros.Pagina.HasValue || filtros.TamañoPagina.HasValue)
            {
                var comprasPaginadas = await _dashboardService.ObtenerComprasPaginadasAsync(filtros);
                return Ok(comprasPaginadas);
            }
            
            // Si no se solicita paginación, devolver todas las compras (comportamiento anterior)
            var dashboard = await _dashboardService.ObtenerDashboardAsync(filtros);
            return Ok(dashboard.Compras);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Error al obtener las compras", message = ex.Message });
        }
    }

    /// <summary>
    /// Obtiene todas las funciones con filtros opcionales
    /// </summary>
    [HttpGet("funciones")]
    public async Task<IActionResult> ObtenerFunciones([FromQuery] FiltrosDashboardDTO filtros)
    {
        try
        {
            var dashboard = await _dashboardService.ObtenerDashboardAsync(filtros);
            return Ok(dashboard.Funciones);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Error al obtener las funciones", message = ex.Message });
        }
    }
}

