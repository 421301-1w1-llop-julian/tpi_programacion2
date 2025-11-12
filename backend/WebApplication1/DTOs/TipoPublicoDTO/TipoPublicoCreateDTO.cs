using System.ComponentModel.DataAnnotations;

namespace WebApplication1.DTOs.TipoPublicoDTO
{
    public class TipoPublicoCreateDTO
    {
        [Required(ErrorMessage = "El nombre es requerido")]
        [StringLength(50, ErrorMessage = "El nombre no puede superar los 50 caracteres")]
        public string? Nombre { get; set; }

        [Range(0, 100, ErrorMessage = "La edad mínima debe estar entre 0 y 100 años")]
        public int? EdadMinima { get; set; }

        [Range(0, 100, ErrorMessage = "La edad máxima debe estar entre 0 y 100 años")]
        public int? EdadMaxima { get; set; }
    }
}