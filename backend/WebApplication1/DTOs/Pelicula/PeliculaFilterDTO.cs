namespace WebApplication1.DTOs.Pelicula
{
    // DTO usado para mapear filtros recibidos por query string
    public class PeliculaFilterDTO
    {
        public int? GeneroId { get; set; }
        public int? IdiomaId { get; set; }
        public int? ClasificacionId { get; set; }
        public int? TipoPublicoId { get; set; }
        public int? MinDuration { get; set; }
        public string? Search { get; set; }
    }
}
