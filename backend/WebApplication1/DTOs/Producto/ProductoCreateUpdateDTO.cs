using System.ComponentModel.DataAnnotations;

namespace WebApplication1.DTOs.Producto
{
    public class ProductoCreateUpdateDTO
    {
        [Required]
        [StringLength(50)]
        public string Nombre { get; set; }

        [StringLength(200)]
        public string Descripcion { get; set; }

        public string Imagen { get; set; }

        [Required]
        public decimal Precio { get; set; }
        public int IdTipoProducto { get; set; }
    }
}
