namespace WebApplication1.DTOs.Dashboard;

public class DashboardDTO
{
    public int TotalReservas { get; set; }
    public int TotalCompras { get; set; }
    public int TotalFunciones { get; set; }
    public int TotalPeliculas { get; set; }
    public decimal IngresosTotales { get; set; }
    public List<PeliculaVistaDTO> PeliculasMasVistas { get; set; } = new();
    public List<ReservaDTO> Reservas { get; set; } = new();
    public List<CompraDTO> Compras { get; set; } = new();
    public List<FuncionDTO> Funciones { get; set; } = new();
}

public class PeliculaVistaDTO
{
    public int IdPelicula { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public int TotalVistas { get; set; }
    public int TotalReservas { get; set; }
    public int TotalCompras { get; set; }
    public decimal IngresosTotales { get; set; }
}

public class ReservaDTO
{
    public int IdReserva { get; set; }
    public int IdCliente { get; set; }
    public string NombreCliente { get; set; } = string.Empty;
    public DateTime FechaHoraReserva { get; set; }
    public DateTime? FechaHoraVencimiento { get; set; }
    public string EstadoReserva { get; set; } = string.Empty;
    public string Pelicula { get; set; } = string.Empty;
    public int CantidadButacas { get; set; }
}

public class CompraDTO
{
    public int IdCompra { get; set; }
    public int IdCliente { get; set; }
    public string NombreCliente { get; set; } = string.Empty;
    public DateTime FechaCompra { get; set; }
    public string FormaPago { get; set; } = string.Empty;
    public string Estado { get; set; } = string.Empty;
    public decimal Total { get; set; }
    public string Pelicula { get; set; } = string.Empty;
}

public class FuncionDTO
{
    public int IdFuncion { get; set; }
    public string Pelicula { get; set; } = string.Empty;
    public string Sala { get; set; } = string.Empty;
    public DateTime FechaHoraInicio { get; set; }
    public decimal PrecioBase { get; set; }
    public int ButacasOcupadas { get; set; }
    public int ButacasDisponibles { get; set; }
}

public class FiltrosDashboardDTO
{
    public DateTime? FechaDesde { get; set; }
    public DateTime? FechaHasta { get; set; }
    public int? IdPelicula { get; set; }
    public int? IdCliente { get; set; }
    public int? IdSala { get; set; }
    public int? TopPeliculas { get; set; }
    public bool? SoloPeliculasMasVistas { get; set; }
}

