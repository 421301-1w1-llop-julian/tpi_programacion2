namespace WebApplication1.DTOs.Funcion
{
    public class FuncionUpdateDTO
    {
        public int IdFuncion { get; set; }
        public int? IdPelicula { get; set; }
        public int? IdSala { get; set; }
        public DateTime? FechaHoraInicio { get; set; }
        public decimal? PrecioBase { get; set; }
    }
}
