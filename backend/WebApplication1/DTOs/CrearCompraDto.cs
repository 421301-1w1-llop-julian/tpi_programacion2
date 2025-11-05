// Archivo: DTOs/CrearCompraDto.cs (Renombrar CrearReservaDto.cs)
namespace Cine2025.DTOs
{
    public class CrearCompraDto
    {
        public int IdCliente { get; set; }
        public int IdFuncion { get; set; }
        // Se recomienda renombrar la propiedad a IdsButaca para mayor claridad
        public List<int> IdsButaca { get; set; } = new();

        // REQUERIMIENTO NUEVO: La tabla compras necesita la forma de pago
        public int IdFormaPago { get; set; }
    }
}