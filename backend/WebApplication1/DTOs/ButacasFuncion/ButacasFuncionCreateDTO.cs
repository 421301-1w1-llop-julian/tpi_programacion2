namespace WebApplication1.DTOs.ButacasFuncion
{
    public class ButacasFuncionCreateDTO
    {
        public int IdFuncion { get; set; }
        public int IdButaca { get; set; }
        public int IdEstadoButaca { get; set; }
        public int? IdReserva { get; set; }
        public int? IdCompra { get; set; }
    }
}

