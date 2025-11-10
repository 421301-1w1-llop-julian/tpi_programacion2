using System.ComponentModel.DataAnnotations;

namespace WebApplication1.DTOs.ClasificacionDTO
{
    public class ClasificacionCreateDTO
    {
        [Required(ErrorMessage = "El nombre es requerido")]
        [StringLength(50, ErrorMessage = "El nombre no puede superar los 50 caracteres")]
        public string Nombre { get; set; }

        [StringLength(200, ErrorMessage = "La descripción no puede superar los 200 caracteres")]
        public string Descripcion { get; set; }
    }
}