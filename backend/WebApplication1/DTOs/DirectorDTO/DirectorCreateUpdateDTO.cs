using System.ComponentModel.DataAnnotations;

namespace WebApplication1.DTOs.DirectorDTO
{
    public class DirectorCreateUpdateDTO
    {
        [Required]
        [StringLength(100)]
        public string Nombre { get; set; }

        [Required]
        [StringLength(100)]
        public string Apellido { get; set; }

        [Required]
        public int IdPais { get; set; }
    }
}

