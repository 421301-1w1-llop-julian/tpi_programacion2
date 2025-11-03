using WebApplication1.Models;

namespace Cine2025.Repositories.Interfaces
{
    public interface IReservasRepository
    {
        Task<Reserva> CrearReservaAsync(int idCliente, int idFuncion, List<int> idsButacas);
        Task<bool> ButacasDisponiblesAsync(int idFuncion, List<int> idsButacas);
    }
}
