using System.ComponentModel.DataAnnotations;

namespace WebApplication1.DTOs.Sala
{
    public class SalaCreateUpdateDTO
    {
        [Required]
        public int IdCine { get; set; }

        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "El número de sala debe ser mayor a 0")]
        public int NumeroSala { get; set; }

        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "La capacidad debe ser mayor a 0")]
        public int Capacidad { get; set; }

        [Required]
        public int IdTipoSala { get; set; }
    }
}

