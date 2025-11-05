// Archivo: Controllers/ComprasController.cs (Reemplaza/Renombra ReservasController.cs)
using Cine2025.DTOs;
using Cine2025.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims; // Necesario para leer el token
using WebApplication1.Models;

namespace Cine2025.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // IMPIDE el acceso sin un token JWT válido (LOGIN)
    public class ComprasController : ControllerBase
    {
        private readonly ICompraService _service;

        public ComprasController(ICompraService service) // Inyección del nuevo servicio
        {
            _service = service;
        }

        // Método auxiliar para obtener el IdUsuario del token de forma segura
        private int GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int id))
            {
                throw new UnauthorizedAccessException("ID de Usuario no disponible o inválido en el token. Por favor, vuelva a iniciar sesión.");
            }
            return id;
        }

        // Endpoint 1: Agregar butacas (Detalle de Función)
        [HttpPost("butaca")]
        public async Task<IActionResult> AgregarButaca([FromBody] DetalleButacaInputDto dto)
        {
            try
            {
                var idUsuario = GetUserId();
                var idDetalle = await _service.AgregarDetalleButacaAsync(idUsuario, dto);
                return Created($"/api/Compras/Detalle/{idDetalle}", new { message = "Butaca agregada al carro temporal con éxito.", idDetalle = idDetalle });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // Endpoint 2: Agregar productos (Detalle de Producto)
        [HttpPost("producto")]
        public async Task<IActionResult> AgregarProducto([FromBody] DetalleProductoInputDto dto)
        {
            try
            {
                var idUsuario = GetUserId();
                var idDetalle = await _service.AgregarDetalleProductoAsync(idUsuario, dto);
                return Created($"/api/Compras/Detalle/{idDetalle}", new { message = "Producto agregado al carro temporal con éxito.", idDetalle = idDetalle });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }


        // Endpoint 3: Finalizar la compra (Requiere solo forma de pago)
        [HttpPost("Finalizar")]
        public async Task<IActionResult> FinalizarCompra([FromBody] FinalizarCompraDto dto)
        {
            try
            {
                var idUsuario = GetUserId(); // Obtiene el cliente logueado automáticamente
                var idCompra = await _service.FinalizarCompraAsync(idUsuario, dto.IdFormaPago);
                return Created($"/api/Compras/{idCompra}", new { message = "Compra finalizada con éxito.", idCompra = idCompra });
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized(new { error = "Usuario no autorizado. Inicie sesión." });
            }
            catch (Exception ex)
            {
                // Incluye el error de "Carro vacío" que puede venir del servicio
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}