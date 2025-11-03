namespace WebApplication1.DTOs.Usuario
{
    public class UserUpdateDTO
    {
        public string Nombre { get; set; }
        public string Apellido { get; set; }
        public string Email { get; set; }
        public int? IdTipoUsuario { get; set; }
        public string Password { get; set; } // opcional: si viene, se re-hashea
    }
}
