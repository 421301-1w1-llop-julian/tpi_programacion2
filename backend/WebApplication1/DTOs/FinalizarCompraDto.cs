
using System.ComponentModel.DataAnnotations;
namespace WebApplication1.DTOs
{
    public class FinalizarCompraDto
    {
        [Required(ErrorMessage = "La forma de pago es obligatoria.")]
        public int IdFormaPago { get; set; }
    }
}
