using System.ComponentModel.DataAnnotations;

namespace WebApplication1.DTOs.GeneroDTO
{
    public class GeneroCreateUpdateDTO
    {
        [Required]
        [StringLength(100)]
        public string Nombre { get; set; }
    }
}

