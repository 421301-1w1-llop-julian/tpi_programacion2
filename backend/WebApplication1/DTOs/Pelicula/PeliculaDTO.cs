namespace WebApplication1.DTOs.Pelicula
{
    public class PeliculaDTO
    {
        public int IdPelicula { get; set; }
        public string Nombre { get; set; }
        public string Descripcion { get; set; }
        public string Imagen { get; set; }
        public int Duracion { get; set; }
        public DateOnly? FechaEstreno { get; set; }
        public int IdClasificacion { get; set; }
        public string Clasificacion { get; set; } // desde IdClasificacionNavigation
        public int IdPais { get; set; }
        public string Pais { get; set; } // desde IdPaisNavigation
        public int IdDistribuidora { get; set; }
        public string Distribuidora { get; set; } // desde IdDistribuidoraNavigation
        public int IdTipoPublico { get; set; }
        public string TipoPublico { get; set; } // desde IdTipoPublicoNavigation

        // Relaciones opcionales (solo si las necesitás)
        public List<string>? Generos { get; set; }
        public List<int>? GeneroIds { get; set; }
        public List<string>? Idiomas { get; set; }
        public List<int>? IdiomaIds { get; set; }
        public List<string>? Actores { get; set; }
        public List<int>? ActorIds { get; set; }
        public List<string>? Directores { get; set; }
        public List<int>? DirectorIds { get; set; }
    }
}
