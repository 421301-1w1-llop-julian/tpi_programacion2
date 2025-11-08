using System.ComponentModel.DataAnnotations;

namespace WebApplication1.DTOs.TiposUsuariosDTO
{
    public class TiposUsuarioCreateUpdateDTO
    {
        [Required]
        [StringLength(50)]
        public string TipoUsuario { get; set; }

        [StringLength(200)]
        public string Descripcion { get; set; }
    }
}
