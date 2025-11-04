namespace Cine2025.DTOs
{
    public class CrearReservaDto
    {
        public int IdFuncion { get; set; }
        public List<int> Butacas { get; set; } = new();
    }
}
