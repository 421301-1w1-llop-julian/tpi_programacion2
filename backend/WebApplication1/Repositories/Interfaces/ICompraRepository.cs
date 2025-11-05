// Archivo: Repositories/Interfaces/ICompraRepository.cs (Reemplaza/Renombra IReservasRepository.cs)
using WebApplication1.Models; // Asume que tus modelos están aquí

namespace Cine2025.Repositories.Interfaces
{
    public interface ICompraRepository
    {
        // Lógica de Carro/Butacas
        Task<bool> ButacaDisponibleAsync(int idFuncion, int idButaca);
        Task<bool> DetalleButacaExisteEnCarroAsync(int idUsuario, int idButaca);
        Task<int> AgregarDetalleButacaAsync(int idUsuario, int idFuncion, int idButaca);

        // Lógica de Productos
        Task<int> AgregarDetalleProductoAsync(int idUsuario, int idProducto, int cantidad);

        // Lógica del Carro
        Task<int> GetTotalItemsCarroAsync(int idUsuario);

        // Transacción Final
        Task<int> FinalizarCompraTransaccionAsync(int idUsuario, int idFormaPago);
    }
}
