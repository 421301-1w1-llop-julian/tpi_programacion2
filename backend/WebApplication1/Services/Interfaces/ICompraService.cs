using Cine2025.DTOs;
using WebApplication1.DTOs;

namespace Cine2025.Services.Interfaces
{
    public interface ICompraService
    {
        // Agrega una butaca (función) al carro temporal (Reserva)
        Task<int> AgregarDetalleButacaAsync(int idUsuario, DetalleButacaInputDto dto);

        // Agrega un producto (candy bar) al carro temporal (Reserva)
        Task<int> AgregarDetalleProductoAsync(int idUsuario, DetalleProductoInputDto dto);

        // Convierte el carro temporal en Compra (recibe IdFormaPago, obtiene IdCliente del token)
        Task<int> FinalizarCompraAsync(int idUsuario, int idFormaPago);
    }
}
