// Archivo: Repositories/Interfaces/ICompraRepository.cs (Simplificación)
using Cine2025.DTOs;

namespace Cine2025.Repositories.Interfaces
{
    public interface ICompraRepository
    {
        // Método único de transacción
        Task<int> CrearCompraTransaccionAsync(int idUsuario, CompraInputDto dto);

        // Se mantiene la verificación de disponibilidad (llamada desde Service)
        Task<bool> ButacaDisponibleAsync(int idFuncion, int idButaca);
    }
}