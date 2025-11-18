namespace WebApplication1.DTOs.Pelicula
{
    public class PeliculaVistaDTO
    {
        public int IdPelicula { get; set; }
        public string Nombre { get; set; }

        // Total de entradas vendidas (sum(Cantidad))
        public int TotalCompras { get; set; }

        // Total recaudado (sum(PrecioUnitario * Cantidad))
        public decimal IngresosTotales { get; set; }

        // Entradas = vistas (según lo que definiste)
        public int TotalVistas => TotalCompras;
    }
}
