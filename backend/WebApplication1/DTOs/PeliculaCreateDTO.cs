namespace WebApplication1.DTOs
{
    public class PeliculaCreateDTO
    {
        public string Nombre { get; set; }
        public string Descripcion { get; set; }
        public int Duracion { get; set; }
        public DateOnly? FechaEstreno { get; set; }
        public int IdClasificacion { get; set; }
        public int IdPais { get; set; }
        public int IdDistribuidora { get; set; }
        public int IdTipoPublico { get; set; }

        // Relaciones opcionales (si querés crear asociaciones de entrada)
        public List<int>? GeneroIds { get; set; }
        public List<int>? IdiomaIds { get; set; }
        public List<int>? ActorIds { get; set; }
        public List<int>? DirectorIds { get; set; }
    }
}
