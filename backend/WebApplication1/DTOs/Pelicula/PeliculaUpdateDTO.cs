namespace WebApplication1.DTOs.Pelicula
{
    public class PeliculaUpdateDTO
    {
        public int IdPelicula { get; set; }
        public string? Nombre { get; set; }
        public string? Descripcion { get; set; }
        public string Imagen { get; set; }
        public int? Duracion { get; set; }
        public DateOnly? FechaEstreno { get; set; }
        public int? IdClasificacion { get; set; }
        public int? IdPais { get; set; }
        public int? IdDistribuidora { get; set; }
        public int? IdTipoPublico { get; set; }

        // Actualizaciones de relaciones (opcionales)
        public List<int>? GeneroIds { get; set; }
        public List<int>? IdiomaIds { get; set; }
        public List<int>? ActorIds { get; set; }
        public List<int>? DirectorIds { get; set; }
    }
}
