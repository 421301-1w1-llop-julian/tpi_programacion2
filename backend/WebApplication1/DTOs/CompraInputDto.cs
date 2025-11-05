// Archivo: DTOs/CompraInputDto.cs
using System.ComponentModel.DataAnnotations;

namespace Cine2025.DTOs
{
    public class CompraInputDto
    {
        [Required(ErrorMessage = "La forma de pago es obligatoria.")]
        public int IdFormaPago { get; set; }

        // Lista de todas las butacas seleccionadas (un asiento por entrada en la lista)
        public List<ButacaSeleccionadaDto> Butacas { get; set; } = new List<ButacaSeleccionadaDto>();

        // Lista de productos del Candy Bar (pueden ser múltiples tipos con cantidades)
        public List<ProductoCompradoDto> Productos { get; set; } = new List<ProductoCompradoDto>();
    }

    public class ButacaSeleccionadaDto
    {
        [Required]
        public int IdFuncion { get; set; }

        [Required(ErrorMessage = "El número de butaca (IdButaca) es obligatorio.")]
        public int IdButaca { get; set; } // El número de asiento (ej: 5)
    }

    public class ProductoCompradoDto
    {
        [Required]
        public int IdProducto { get; set; }

        [Required]
        [Range(1, 99, ErrorMessage = "La cantidad debe ser mayor a 0.")]
        public int Cantidad { get; set; }
    }
}