
using Cine2025.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using WebApplication1.Models;

namespace Cine2025.Repositories
{
    public class ReservasRepository : IReservasRepository
    {
        private readonly CINE_2025_1W1_GRUPO_5Context _context;

        public ReservasRepository(CINE_2025_1W1_GRUPO_5Context context)
        {
            _context = context;
        }

        public async Task<Reserva> CrearReservaAsync(int idUsuario, int idFuncion, List<int> idsButacas)
        {
            var idCliente = await _context.Usuarios
                .Where(u => u.IdUsuario == idUsuario)
                .Select(u => u.IdCliente)
                .FirstOrDefaultAsync();

            if (idCliente == null || idCliente.Value == 0)
            {
                throw new InvalidOperationException("El usuario logueado no está asociado a una entidad cliente y no puede realizar reservas.");
            }

            int idClienteReal = idCliente.Value;
            var reserva = new Reserva
            {
                IdCliente = idClienteReal, 
                FechaHoraReserva = DateTime.Now,
                FechaHoraVencimiento = DateTime.Now.AddHours(2),
                IdEstadoReserva = 1 
            };

            _context.Reservas.Add(reserva);
            await _context.SaveChangesAsync();

            foreach (var idButaca in idsButacas)
            {
                _context.DetalleReservas.Add(new DetalleReserva
                {
                    IdReserva = reserva.IdReserva,
                    IdFuncion = idFuncion,
                    IdButaca = idButaca
                });

                var butacaFuncion = await _context.ButacasFuncions
                    .FirstOrDefaultAsync(b => b.IdFuncion == idFuncion && b.IdButaca == idButaca);

                if (butacaFuncion != null)
                {
                    butacaFuncion.IdEstadoButaca = 2; 
                    butacaFuncion.IdReserva = reserva.IdReserva;
                }
            }

            await _context.SaveChangesAsync();
            return reserva;
        }

        public async Task<bool> ButacasDisponiblesAsync(int idFuncion, List<int> idsButacas)
        {
            
            return !await _context.ButacasFuncions
                .AnyAsync(b => b.IdFuncion == idFuncion &&
                               idsButacas.Contains(b.IdButaca) &&
                               b.IdEstadoButaca != 1);
        }
    }
}
