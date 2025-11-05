using System.ComponentModel.DataAnnotations;

namespace WebApplication1.DTOs.IdiomaDTO
{
    public class IdiomaCreateUpdateDTO
    {
        [Required]
        [StringLength(100)]
        public string Nombre { get; set; }

        public bool Subtitulado { get; set; }

        public bool Doblado { get; set; }
    }
}

