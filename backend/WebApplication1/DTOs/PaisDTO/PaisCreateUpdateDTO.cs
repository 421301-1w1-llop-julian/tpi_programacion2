using System.ComponentModel.DataAnnotations;

namespace WebApplication1.DTOs.PaisDTO
{
    public class PaisCreateUpdateDTO
    {
        [Required]
        [StringLength(100)]
        public string Nombre { get; set; }
    }
}

