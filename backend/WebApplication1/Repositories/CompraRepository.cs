// Archivo: Repositories/CompraRepository.cs
using Cine2025.DTOs;
using Cine2025.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using WebApplication1.Models; // Asegúrate de que este es el namespace de tus modelos generados

namespace Cine2025.Repositories
{
    // Asegúrate de que esta clase implemente ICompraRepository
    public class CompraRepository : ICompraRepository
    {
        private readonly CINE_2025_1W1_GRUPO_5Context _context;

        // Constantes del sistema
        private const string ESTADO_COMPRA_FINALIZADA = "Confirmada";
        private const int ID_ESTADO_BUTACA_VENDIDA = 3; // Asumiendo 3 es Vendida

        public CompraRepository(CINE_2025_1W1_GRUPO_5Context context)
        {
            _context = context;
        }

        // Método auxiliar para obtener el ID de Cliente
        private async Task<int> GetIdClienteFromIdUsuarioAsync(int idUsuario)
        {
            var usuario = await _context.Usuarios.FindAsync(idUsuario);
            if (usuario == null || usuario.IdCliente == null)
                throw new Exception($"El usuario con ID {idUsuario} no está asociado a una cuenta de cliente.");

            return usuario.IdCliente.Value;
        }

        // Método de validación de disponibilidad de butaca (usado en el Service)
        public async Task<bool> ButacaDisponibleAsync(int idFuncion, int idButaca)
        {
            // Disponible si el estado es 1 (Libre)
            // Cualquier otro estado (2: Reservada, 3: Vendida, etc.) significa NO disponible
            return !await _context.ButacasFuncions
                .AnyAsync(b => b.IdFuncion == idFuncion &&
                               b.IdButaca == idButaca &&
                               b.IdEstadoButaca != 1);
        }

        // Método principal que gestiona la transacción completa
        public async Task<int> CrearCompraTransaccionAsync(int idUsuario, CompraInputDto dto)
        {
            var idCliente = await GetIdClienteFromIdUsuarioAsync(idUsuario);

            // 🔒 Usaremos una transacción explícita para garantizar la atomicidad (si algo falla, se revierte todo)
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // --- 1. Crear la Compra Principal ---
                var compra = new Compra
                {
                    IdCliente = idCliente,
                    IdFormaPago = dto.IdFormaPago,
                    FechaCompra = DateTime.Now,
                    Estado = ESTADO_COMPRA_FINALIZADA
                };
                _context.Compras.Add(compra);
                await _context.SaveChangesAsync(); // Guardar para obtener id_compra

                // --- 2. Procesar Butacas (Múltiples Detalles) ---
                foreach (var butacaDto in dto.Butacas)
                {
                    // Buscar ButacaFuncion para obtener IdButacaFuncion y precio de la función
                    var butacaFuncion = await _context.ButacasFuncions
                        .Include(bf => bf.IdFuncionNavigation)
                        .FirstOrDefaultAsync(b => b.IdFuncion == butacaDto.IdFuncion && b.IdButaca == butacaDto.IdButaca);

                    if (butacaFuncion == null || butacaFuncion.IdFuncionNavigation == null)
                        throw new Exception($"Error: Butaca {butacaDto.IdButaca} o Función {butacaDto.IdFuncion} no encontrada.");

                    // 2a. Actualizar ButacaFuncion: Marcar como Vendida
                    butacaFuncion.IdEstadoButaca = ID_ESTADO_BUTACA_VENDIDA;
                    butacaFuncion.IdCompra = compra.IdCompra;

                    // 2b. Crear DetalleCompra (CORRECCIÓN: Usando _context.DetallesCompras.Add)
                    _context.DetallesCompras.Add(new DetallesCompra // 👈 USO DEL DbSet CORREGIDO
                    {
                        IdCompra = compra.IdCompra,
                        IdFuncion = butacaDto.IdFuncion,
                        IdButacaFuncion = butacaFuncion.IdButacaFuncion,
                        IdProducto = null,
                        Cantidad = 1, // Cantidad es siempre 1 para un asiento
                        PrecioUnitario = butacaFuncion.IdFuncionNavigation.PrecioBase // Precio de la función
                    });
                }

                // --- 3. Procesar Productos (Múltiples Detalles) ---
                foreach (var productoDto in dto.Productos)
                {
                    // Buscar Producto para obtener precio
                    var producto = await _context.Productos
                        .FirstOrDefaultAsync(p => p.IdProducto == productoDto.IdProducto);

                    if (producto == null)
                        throw new Exception($"Error: Producto {productoDto.IdProducto} no encontrado.");

                    // Crear DetalleCompra (CORRECCIÓN: Usando _context.DetallesCompras.Add)
                    _context.DetallesCompras.Add(new DetallesCompra // 👈 USO DEL DbSet CORREGIDO
                    {
                        IdCompra = compra.IdCompra,
                        IdProducto = productoDto.IdProducto,
                        IdFuncion = null,
                        IdButacaFuncion = null,
                        Cantidad = productoDto.Cantidad, // Cantidad del producto
                        PrecioUnitario = producto.Precio // Precio del producto
                    });
                }

                // --- 4. Guardar Todos los Cambios y Confirmar Transacción ---
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return compra.IdCompra;
            }
            catch (Exception ex)
            {
                // 1. Deshacer la transacción
                await transaction.RollbackAsync();
                var innerEx = ex.InnerException;
                string errorMessage = "Error desconocido al procesar la compra.";

                if (innerEx is Microsoft.EntityFrameworkCore.DbUpdateException dbEx)
                {
                    var sqlEx = dbEx.InnerException;
                    errorMessage = sqlEx != null ? sqlEx.Message : dbEx.Message;
                }
                else
                {
                    errorMessage = ex.Message;
                }

                throw new Exception($"Falló la transacción de compra. Causa: {errorMessage}", ex);
            }
        }
    }
}