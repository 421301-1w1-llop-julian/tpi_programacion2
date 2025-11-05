using System.ComponentModel.DataAnnotations;

namespace WebApplication1.DTOs.Producto
{
    public class ProductoDTO
    {
        public int IdProducto { get; set; }
        public string Nombre { get; set; }
        public string Descripcion { get; set; }
        public decimal Precio { get; set; }
        public int IdTipoProducto { get; set; }
    }
}
