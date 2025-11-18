namespace WebApplication1.DTOs.Pelicula
{
    public class PeliculaListDTO
    {
        public int IdPelicula { get; set; }
        public string Nombre { get; set; }
        // Identificadores y datos usados para filtrar en la vista
        public int IdClasificacion { get; set; }
        public int IdTipoPublico { get; set; }

        // Colecciones de ids para géneros e idiomas (una película puede tener varios)
        public List<int> GeneroIds { get; set; } = new List<int>();
        public List<int> IdiomaIds { get; set; } = new List<int>();

        // Datos de presentación
        public string Clasificacion { get; set; } = string.Empty;
        public string Imagen { get; set; } = string.Empty;
        public int Duracion { get; set; }
        public string Pais { get; set; } = string.Empty;
        public DateOnly? FechaEstreno { get; set; }
        public string Descripcion { get; set; } = string.Empty;
    }
}
