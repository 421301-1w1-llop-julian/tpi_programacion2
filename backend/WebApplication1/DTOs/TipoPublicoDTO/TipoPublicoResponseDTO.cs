namespace WebApplication1.DTOs.TipoPublicoDTO
{
    public class TipoPublicoResponseDTO
    {
        public int IdTipoPublico { get; set; }
        public string? Nombre { get; set; }
        public int? EdadMinima { get; set; }
        public int? EdadMaxima { get; set; }
    }
}