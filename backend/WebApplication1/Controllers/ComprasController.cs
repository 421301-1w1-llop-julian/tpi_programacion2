// Archivo: Controllers/ComprasController.cs

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Cine2025.DTOs;
using Cine2025.Services.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;

namespace Cine2025.Controllers
{
    [ApiController]
    [Route("api/[controller]")] // Esto mapea a la ruta /api/Compras
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)] // Requiere que el usuario esté autenticado con un token JWT válido
    public class ComprasController : ControllerBase
    {
        private readonly ICompraService _compraService;

        public ComprasController(ICompraService compraService)
        {
            _compraService = compraService;
        }

        // Método auxiliar para extraer el ID del usuario del token JWT
        // Usa ClaimTypes.NameIdentifier, que es el estándar para el ID de la entidad principal.
        private int GetUserId()
        {
            // Busca el Claim que contiene el ID de usuario (generalmente NameIdentifier o Sub)
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            // Valida que exista y sea un número
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int id))
            {
                // Si llegamos aquí, el token está mal formado o no contiene el ID
                // Esto es una excepción rara bajo [Authorize], pero se maneja.
                throw new UnauthorizedAccessException("ID de Usuario no disponible o inválido en el token.");
            }
            return id;
        }

        // Endpoint único para la compra completa: POST /api/Compras
        [HttpPost]
        [ProducesResponseType(201)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> CrearCompraCompleta([FromBody] CompraInputDto dto)
        {
            try
            {
                // 1. Extraer el ID del usuario autenticado del token
                var idUsuario = GetUserId();

                // 2. Ejecutar la lógica de negocio completa y la transacción atómica
                // El Service se encarga de las validaciones de negocio y de llamar al Repository.
                int idCompra = await _compraService.CrearCompraCompletaAsync(idUsuario, dto);

                // 3. Respuesta de éxito (201 Created)
                return StatusCode(201, new
                {
                    message = "Compra procesada y finalizada con éxito.",
                    idCompra = idCompra
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                // Captura el error si GetUserId falla por un token inválido
                return Unauthorized(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                // Captura los errores de lógica de negocio (ej: butaca ocupada, no cliente, FK, NOT NULL)
                // que son relanzados desde el Service/Repository.
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}