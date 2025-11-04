using Cine2025.DTOs;

namespace Cine2025.Services.Interfaces
{
    public interface IReservaService
    {
        Task<string> CrearReservaAsync(int idUsuario, CrearReservaDto dto);
    }
}
