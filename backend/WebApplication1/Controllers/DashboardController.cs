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
    [HttpGet("pelicula-mas-vista")]
    public async Task<IActionResult> ObtenerPeliculaMasVistaAsync([FromQuery] FiltrosDashboardDTO filtros)
    {
        try
        {
            var peliculas = await _dashboardService.ObtenerPeliculaMasVistaAsync(filtros);
            return Ok(peliculas);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Error al obtener las películas más vistas", message = ex.Message });
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
            // Si no llegan valores, poner los defaults
            filtros.Pagina ??= 1;
            filtros.TamañoPagina ??= 10;

            // Siempre se devuelve paginado
            var comprasPaginadas = await _dashboardService.ObtenerComprasPaginadasAsync(filtros);

            return Ok(comprasPaginadas);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Error al obtener las compras", message = ex.Message });
        }
    }


}

