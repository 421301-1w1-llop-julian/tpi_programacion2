namespace WebApplication1.DTOs.Butaca
{
    public class ButacaDTO
    {
        public int IdButaca { get; set; }
        public int IdSala { get; set; }
        public int NumeroButaca { get; set; }
        public string Fila { get; set; }
        public int IdTipoButaca { get; set; }

        // Navigation info
        public string? SalaNombre { get; set; }
        public int? SalaNumero { get; set; }
        public string? TipoButaca { get; set; }
    }
}

