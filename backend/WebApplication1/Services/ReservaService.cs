using Cine2025.DTOs;
using Cine2025.Repositories.Interfaces;
using Cine2025.Services.Interfaces;

namespace Cine2025.Services
{
    public class ReservaService : IReservaService
    {
        private readonly IReservasRepository _reservasRepo;

        public ReservaService(IReservasRepository reservasRepo)
        {
            _reservasRepo = reservasRepo;
        }

        public async Task<string> CrearReservaAsync(CrearReservaDto dto)
        {
            if (dto.Butacas.Count == 0)
                throw new Exception("Debe seleccionar al menos una butaca.");

            if (dto.Butacas.Count > 6)
                throw new Exception("No puede reservar más de 6 butacas por función.");

            bool disponibles = await _reservasRepo.ButacasDisponiblesAsync(dto.IdFuncion, dto.Butacas);
            if (!disponibles)
                throw new Exception("Una o más butacas ya están reservadas.");

            await _reservasRepo.CrearReservaAsync(dto.IdCliente, dto.IdFuncion, dto.Butacas);

            return "Reserva creada con éxito.";
        }
    }
}
