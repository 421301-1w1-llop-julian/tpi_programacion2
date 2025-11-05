namespace WebApplication1.DTOs.Pelicula
{
    public class PeliculaListDTO
    {
        public int IdPelicula { get; set; }
        public string Nombre { get; set; }
        public string Clasificacion { get; set; }
        public string Pais { get; set; }
        public DateOnly? FechaEstreno { get; set; }
    }
}
