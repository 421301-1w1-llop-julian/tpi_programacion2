namespace WebApplication1.DTOs.Funcion
{
    public class FuncionDTO
    {
        public int IdFuncion { get; set; }
        public int IdPelicula { get; set; }
        public string TituloPelicula { get; set; } // extraído de Pelicula
        public int IdSala { get; set; }
        public string NombreSala { get; set; } // extraído de Sala
        public DateTime FechaHoraInicio { get; set; }
        public decimal PrecioBase { get; set; }

        // Si querés incluir relaciones (solo si son necesarias)
        public List<int>? ButacasFuncionIds { get; set; }
        public List<int>? DetalleReservaIds { get; set; }
        public List<int>? DetalleCompraIds { get; set; }
        public List<int>? FechasHorasEspecialesIds { get; set; }
    }
}
