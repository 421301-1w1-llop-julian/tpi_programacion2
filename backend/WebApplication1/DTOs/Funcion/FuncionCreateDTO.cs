namespace WebApplication1.DTOs.Funcion
{
    public class FuncionCreateDTO
    {
        public int IdPelicula { get; set; }
        public int IdSala { get; set; }
        public DateTime FechaHoraInicio { get; set; }
        public decimal PrecioBase { get; set; }
    }
}
