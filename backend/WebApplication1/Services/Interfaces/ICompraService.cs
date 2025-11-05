// Archivo: Services/Interfaces/ICompraService.cs
using Cine2025.DTOs;

namespace Cine2025.Services.Interfaces
{
    public interface ICompraService
    {
        // Único método: Recibe la compra completa y la procesa.
        Task<int> CrearCompraCompletaAsync(int idUsuario, CompraInputDto dto);
    }
}