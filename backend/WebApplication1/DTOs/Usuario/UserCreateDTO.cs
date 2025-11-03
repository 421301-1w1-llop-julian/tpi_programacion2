namespace WebApplication1.DTOs.Usuario
{
    public class UserCreateDTO
    {
        public string Username { get; set; }
        public string Password { get; set; }
        public string Nombre { get; set; }
        public string Apellido { get; set; }
        public string Email { get; set; }
        public int IdTipoUsuario { get; set; }
    }
}
