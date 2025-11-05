// Archivo: Repositories/CompraRepository.cs (Versión Final Corregida)
using Cine2025.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using WebApplication1.Models;

namespace Cine2025.Repositories
{
    public class CompraRepository : ICompraRepository
    {
        private readonly CINE_2025_1W1_GRUPO_5Context _context;

        // --- Constantes del sistema ---
        private const string ESTADO_CARRO_TEMPORAL = "Carro Temporal";
        private const string ESTADO_COMPRA_FINALIZADA = "Confirmada";
        private const int ID_ESTADO_BUTACA_RESERVADA = 2; // Estado temporal para el carro
        private const int ID_ESTADO_BUTACA_VENDIDA = 3;

        // ⚠️ CORRECCIÓN CRUCIAL: Debe existir un ID válido en la tabla formas_pago.
        // Asume que 1 es un ID existente o un valor por defecto. AJUSTAR SI ES NECESARIO.
        private const int ID_FORMA_PAGO_DEFAULT_TEMPORAL = 1;

        public CompraRepository(CINE_2025_1W1_GRUPO_5Context context)
        {
            _context = context;
        }

        // --- MÉTODOS AUXILIARES ---

        private async Task<int> GetIdClienteFromIdUsuarioAsync(int idUsuario)
        {
            var usuario = await _context.Usuarios.FindAsync(idUsuario);
            if (usuario == null || usuario.IdCliente == null)
                throw new Exception($"El usuario con ID {idUsuario} no está asociado a una cuenta de cliente.");

            return usuario.IdCliente.Value;
        }

        // Método para obtener o crear la Compra temporal (el carro)
        private async Task<Compra> GetOrCreateCarroCompraAsync(int idCliente)
        {
            var carro = await _context.Compras
                .FirstOrDefaultAsync(c => c.IdCliente == idCliente && c.Estado == ESTADO_CARRO_TEMPORAL);

            if (carro == null)
            {
                carro = new Compra
                {
                    IdCliente = idCliente,
                    FechaCompra = DateTime.Now,
                    // ✅ CORRECCIÓN APLICADA: Proporcionar un ID inicial para satisfacer la restricción NOT NULL
                    IdFormaPago = ID_FORMA_PAGO_DEFAULT_TEMPORAL,
                    Estado = ESTADO_CARRO_TEMPORAL
                };
                _context.Compras.Add(carro);
                await _context.SaveChangesAsync();
            }
            return carro;
        }

        // --- LÓGICA DE BUTACAS ---

        public async Task<bool> ButacaDisponibleAsync(int idFuncion, int idButaca)
        {
            // Disponible si el estado es 1 (Libre)
            return !await _context.ButacasFuncions
                .AnyAsync(b => b.IdFuncion == idFuncion &&
                               b.IdButaca == idButaca &&
                               b.IdEstadoButaca != 1);
        }

        public async Task<bool> DetalleButacaExisteEnCarroAsync(int idUsuario, int idButaca)
        {
            var idCliente = await GetIdClienteFromIdUsuarioAsync(idUsuario);

            var carroCompra = await _context.Compras
                .FirstOrDefaultAsync(c => c.IdCliente == idCliente && c.Estado == ESTADO_CARRO_TEMPORAL);

            if (carroCompra == null) return false;

            // Buscamos si existe la ButacaFuncion asociada a este Butaca
            var butacaFuncion = await _context.ButacasFuncions
                .FirstOrDefaultAsync(b => b.IdButaca == idButaca &&
                                          b.IdEstadoButaca == ID_ESTADO_BUTACA_RESERVADA &&
                                          b.IdReserva == carroCompra.IdCompra);

            if (butacaFuncion == null) return false;

            // Buscamos el DetalleCompra por el IdButacaFuncion
            return await _context.DetallesCompras
                .AnyAsync(dc => dc.IdCompra == carroCompra.IdCompra &&
                                dc.IdButacaFuncion.HasValue &&
                                dc.IdButacaFuncion.Value == butacaFuncion.IdButacaFuncion);
        }

        public async Task<int> AgregarDetalleButacaAsync(int idUsuario, int idFuncion, int idButaca)
        {
            var idCliente = await GetIdClienteFromIdUsuarioAsync(idUsuario);
            var carroCompra = await GetOrCreateCarroCompraAsync(idCliente);

            var butacaFuncion = await _context.ButacasFuncions
                .FirstOrDefaultAsync(b => b.IdFuncion == idFuncion && b.IdButaca == idButaca);

            if (butacaFuncion == null)
                throw new Exception("Error interno: No se encontró la entidad ButacaFuncion.");

            // 1. Marcar ButacaFuncion como Reservada (2) y vincular a la Compra temporal (IdReserva)
            butacaFuncion.IdEstadoButaca = ID_ESTADO_BUTACA_RESERVADA;
            butacaFuncion.IdReserva = carroCompra.IdCompra;
            await _context.SaveChangesAsync();

            // 2. Agregar DetalleCompra: Usamos IdButacaFuncion
            var detalleCompra = new DetallesCompra
            {
                IdCompra = carroCompra.IdCompra,
                IdFuncion = idFuncion,
                IdButacaFuncion = butacaFuncion.IdButacaFuncion,
                IdProducto = null,
                Cantidad = 1,
                PrecioUnitario = 0m
            };
            _context.DetallesCompras.Add(detalleCompra);
            await _context.SaveChangesAsync();

            return detalleCompra.IdDetalleCompra;
        }

        // --- LÓGICA DE PRODUCTOS ---

        public async Task<int> AgregarDetalleProductoAsync(int idUsuario, int idProducto, int cantidad)
        {
            var idCliente = await GetIdClienteFromIdUsuarioAsync(idUsuario);
            var carroCompra = await GetOrCreateCarroCompraAsync(idCliente);

            var detalleCompra = new DetallesCompra
            {
                IdCompra = carroCompra.IdCompra,
                IdProducto = idProducto,
                IdFuncion = null,
                IdButacaFuncion = null,
                Cantidad = cantidad,
                PrecioUnitario = 0m
            };
            _context.DetallesCompras.Add(detalleCompra);
            await _context.SaveChangesAsync();

            return detalleCompra.IdDetalleCompra;
        }

        // --- LÓGICA DEL CARRO Y FINALIZACIÓN ---

        public async Task<int> GetTotalItemsCarroAsync(int idUsuario)
        {
            var idCliente = await GetIdClienteFromIdUsuarioAsync(idUsuario);

            var carroCompra = await _context.Compras
                .FirstOrDefaultAsync(c => c.IdCliente == idCliente && c.Estado == ESTADO_CARRO_TEMPORAL);

            if (carroCompra == null) return 0;

            return await _context.DetallesCompras
                .Where(dc => dc.IdCompra == carroCompra.IdCompra)
                .SumAsync(dc => dc.IdProducto != null ? dc.Cantidad : 1);
        }


        public async Task<int> FinalizarCompraTransaccionAsync(int idUsuario, int idFormaPago)
        {
            var idCliente = await GetIdClienteFromIdUsuarioAsync(idUsuario);

            var carroCompra = await _context.Compras
                .Include(c => c.DetallesCompras)
                    .ThenInclude(dc => dc.IdFuncionNavigation) // Para el precio base de la función
                .Include(c => c.DetallesCompras)
                    .ThenInclude(dc => dc.IdProductoNavigation) // Para el precio base del producto
                .Include(c => c.DetallesCompras)
                    .ThenInclude(dc => dc.IdButacaFuncionNavigation) // Para acceder al ButacaFuncion
                .FirstOrDefaultAsync(c => c.IdCliente == idCliente && c.Estado == ESTADO_CARRO_TEMPORAL);

            if (carroCompra == null || !carroCompra.DetallesCompras.Any())
                throw new Exception("No hay ítems en el carro de compra para procesar.");

            // ✅ CORRECCIÓN APLICADA: Actualizar la Compra temporal con los datos finales
            carroCompra.IdFormaPago = idFormaPago; // Este es el valor final de la forma de pago
            carroCompra.FechaCompra = DateTime.Now;
            carroCompra.Estado = ESTADO_COMPRA_FINALIZADA;

            // 3. Procesar DetalleCompra y ButacasFuncion
            foreach (var detalleCompra in carroCompra.DetallesCompras)
            {
                if (detalleCompra.IdButacaFuncion.HasValue)
                {
                    var butacaFuncion = detalleCompra.IdButacaFuncionNavigation;

                    if (butacaFuncion == null || butacaFuncion.IdFuncionNavigation == null)
                        throw new Exception("Error de mapeo: Información de Función/Butaca faltante.");

                    // Precio de la Función
                    detalleCompra.PrecioUnitario = butacaFuncion.IdFuncionNavigation.PrecioBase;

                    // Actualizar ButacaFuncion: A Vendida y vincular a la Compra, desvincular del carro temporal
                    butacaFuncion.IdEstadoButaca = ID_ESTADO_BUTACA_VENDIDA;
                    butacaFuncion.IdCompra = carroCompra.IdCompra;
                    butacaFuncion.IdReserva = null;
                }
                else if (detalleCompra.IdProducto.HasValue)
                {
                    if (detalleCompra.IdProductoNavigation == null)
                        throw new Exception("Error de mapeo: Producto no encontrado para el precio.");

                    // Precio del Producto
                    detalleCompra.PrecioUnitario = detalleCompra.IdProductoNavigation.Precio;
                }
            }

            await _context.SaveChangesAsync();
            return carroCompra.IdCompra;
        }
    }
}