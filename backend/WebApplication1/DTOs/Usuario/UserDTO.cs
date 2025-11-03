namespace Cine2025.DTOs
{
    // DTOs/UserDto.cs
    public class UserDTO
    {
        public int IdUsuario { get; set; }
        public string Username { get; set; }
        public string Nombre { get; set; }
        public string Apellido { get; set; }
        public string Email { get; set; }
        public int IdTipoUsuario { get; set; }

        public bool? Activo { get; set; }
    }
}
