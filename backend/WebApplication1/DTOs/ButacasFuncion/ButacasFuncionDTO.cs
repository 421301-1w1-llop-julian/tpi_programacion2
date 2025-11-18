namespace WebApplication1.DTOs.ButacasFuncion
{
    public class ButacasFuncionDTO
    {
        public int IdButacaFuncion { get; set; }
        public int IdFuncion { get; set; }
        public int IdButaca { get; set; }
        public int IdEstadoButaca { get; set; }
        public int? IdReserva { get; set; }
        public int? IdCompra { get; set; }

        // Seat info
        public string? Fila { get; set; }
        public int? NumeroButaca { get; set; }
        public int? IdSala { get; set; }
        public string? TipoButaca { get; set; }
    }
}

