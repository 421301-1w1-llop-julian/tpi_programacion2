// Archivo: Services/CompraService.cs
using Cine2025.DTOs;
using Cine2025.Repositories.Interfaces;
using Cine2025.Services.Interfaces;

namespace Cine2025.Services
{
    public class CompraService : ICompraService
    {
        private readonly ICompraRepository _compraRepo;

        public CompraService(ICompraRepository compraRepo)
        {
            _compraRepo = compraRepo;
        }

        public async Task<int> CrearCompraCompletaAsync(int idUsuario, CompraInputDto dto)
        {
            var totalItems = dto.Butacas.Count + dto.Productos.Sum(p => p.Cantidad);

            // 1. Validaciones Preliminares de Negocio
            if (totalItems == 0)
                throw new Exception("La compra debe contener al menos un ítem (butaca o producto).");

            if (dto.Butacas.Count > 6)
                throw new Exception("No se pueden comprar más de 6 butacas en una sola transacción.");

            // 2. Validación de Disponibilidad de Butacas
            foreach (var butaca in dto.Butacas)
            {
                // Verifica que la butaca esté libre. Si no lo está, se detiene antes de la DB.
                if (!await _compraRepo.ButacaDisponibleAsync(butaca.IdFuncion, butaca.IdButaca))
                {
                    throw new Exception($"La butaca {butaca.IdButaca} para la función {butaca.IdFuncion} ya está ocupada o reservada.");
                }
            }

            // 3. Ejecución de la Transacción
            // El Repositorio manejará la creación de la Compra y todos sus Detalles en una sola transacción.
            return await _compraRepo.CrearCompraTransaccionAsync(idUsuario, dto);
        }
    }
}