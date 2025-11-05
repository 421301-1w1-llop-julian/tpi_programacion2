using System.ComponentModel.DataAnnotations;

namespace WebApplication1.DTOs.TiposProductoDTO
{
    public class TiposProductoCreateUpdateDTO
    {
        [Required]
        [StringLength(50)]
        public string TipoProducto { get; set; }
    }
}
