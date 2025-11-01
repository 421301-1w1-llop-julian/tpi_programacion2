namespace Cine2025.DTOs
{
    public class UsuarioRegistroDto
    {
        public string Username { get; set; } = null!;
        public string Password { get; set; } = null!;
        public string Nombre { get; set; } = null!;
        public string Apellido { get; set; } = null!;
        public string Email { get; set; } = null!;
    }

    public class UsuarioLoginDto
    {
        public string Username { get; set; } = null!;
        public string Password { get; set; } = null!;
    }

    public class UsuarioRespuestaDto
    {
        public int IdUsuario { get; set; }
        public string Username { get; set; } = null!;
        public string NombreCompleto { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string TipoUsuario { get; set; } = null!;
    }
}
