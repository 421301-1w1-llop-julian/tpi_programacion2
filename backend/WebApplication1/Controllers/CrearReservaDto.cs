using Microsoft.AspNetCore.Mvc;

namespace WebApplication1.Controllers
{
    public class CrearReservaDto : Controller
    {
        public int IdFuncion { get; set; }
        public List<int> Butacas { get; set; } = new();
    }
}
