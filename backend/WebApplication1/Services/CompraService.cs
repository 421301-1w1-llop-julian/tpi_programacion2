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

        // Método actualizado: recibe idUsuario
        public async Task<string> CrearReservaAsync(int idUsuario, CrearReservaDto dto)
        {
            if (dto.Butacas.Count == 0)
                throw new Exception("Debe seleccionar al menos una butaca.");

            if (dto.Butacas.Count > 6)
                throw new Exception("No puede reservar más de 6 butacas por función.");

            bool disponibles = await _reservasRepo.ButacasDisponiblesAsync(dto.IdFuncion, dto.Butacas);
            if (!disponibles)
                throw new Exception("Una o más butacas ya están reservadas.");

            // Llama al repositorio con el ID del usuario
            await _reservasRepo.CrearReservaAsync(idUsuario, dto.IdFuncion, dto.Butacas); // ¡Cambio!

            return "Reserva creada con éxito.";
        }
    }
}
