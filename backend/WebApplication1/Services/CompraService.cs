// Archivo: Services/CompraService.cs (Reemplaza/Renombra ReservaService.cs)
using Cine2025.DTOs;
using Cine2025.Repositories.Interfaces;
using Cine2025.Services.Interfaces;
using WebApplication1.DTOs;

namespace Cine2025.Services
{
    public class CompraService : ICompraService
    {
        private readonly ICompraRepository _compraRepo; // Asume IReservasRepository fue renombrado

        public CompraService(ICompraRepository compraRepo)
        {
            _compraRepo = compraRepo;
        }

        public async Task<int> AgregarDetalleButacaAsync(int idUsuario, DetalleButacaInputDto dto)
        {
            // 1. Verificar si la butaca ya fue añadida (para evitar duplicados)
            if (await _compraRepo.DetalleButacaExisteEnCarroAsync(idUsuario, dto.IdButaca))
                throw new Exception("Esta butaca ya está en tu carro de compra.");

            // 2. Verificar disponibilidad de la butaca
            if (!await _compraRepo.ButacaDisponibleAsync(dto.IdFuncion, dto.IdButaca))
                throw new Exception("La butaca seleccionada ya está ocupada o reservada.");

            // 3. Validación de límite de 6 ítems (butacas + productos)
            if (await _compraRepo.GetTotalItemsCarroAsync(idUsuario) >= 6)
                throw new Exception("No puede agregar más de 6 ítems al carro de compra.");

            // 4. Llama al repositorio
            return await _compraRepo.AgregarDetalleButacaAsync(idUsuario, dto.IdFuncion, dto.IdButaca);
        }

        public async Task<int> AgregarDetalleProductoAsync(int idUsuario, DetalleProductoInputDto dto)
        {
            if (dto.Cantidad <= 0)
                throw new Exception("La cantidad del producto debe ser mayor a cero.");

            // 1. Validación de límite de 6 ítems
            if (await _compraRepo.GetTotalItemsCarroAsync(idUsuario) >= 6)
                throw new Exception("No puede agregar más de 6 ítems al carro de compra.");

            // 2. Llama al repositorio
            return await _compraRepo.AgregarDetalleProductoAsync(idUsuario, dto.IdProducto, dto.Cantidad);
        }

        public async Task<int> FinalizarCompraAsync(int idUsuario, int idFormaPago)
        {
            // 1. Validación de negocio: debe haber al menos un detalle
            if (await _compraRepo.GetTotalItemsCarroAsync(idUsuario) == 0)
                throw new Exception("No hay butacas o productos en el carro de compra para finalizar la transacción.");

            // 2. Ejecuta la transacción completa
            return await _compraRepo.FinalizarCompraTransaccionAsync(idUsuario, idFormaPago);
        }
    }
}