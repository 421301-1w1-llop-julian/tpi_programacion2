
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

        public async Task<Reserva> CrearReservaAsync(int idCliente, int idFuncion, List<int> idsButacas)
        {
            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var reserva = new Reserva
                {
                    IdCliente = idCliente,
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

                    if (butacaFuncion == null)
                    {
                        throw new InvalidOperationException($"Error de integridad: La Función ID {idFuncion} o la Butaca ID {idButaca} no está configurada para esta función.");
                    }

                    butacaFuncion.IdEstadoButaca = 2; 
                }

                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                return reserva;
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();

                throw;
            }
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
