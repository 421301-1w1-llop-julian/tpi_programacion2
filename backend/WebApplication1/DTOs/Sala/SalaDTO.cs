using System.ComponentModel.DataAnnotations;

namespace WebApplication1.DTOs.Sala
{
    public class SalaDTO
    {
        public int IdSala { get; set; }
        public int NumeroSala { get; set; }
        public int Capacidad { get; set; }

        public int IdCine { get; set; }
        public string? CineNombre { get; set; }

        public int IdTipoSala { get; set; }
        public string? TipoSalaNombre { get; set; }
    }
}

