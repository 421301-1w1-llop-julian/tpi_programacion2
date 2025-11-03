using Cine2025.DTOs;

namespace WebApplication1.DTOs.Usuario
{
    public class AuthResponseDTO
    {
        public string Token { get; set; }
        public DateTime ExpiresAt { get; set; }
        public UserDTO User { get; set; }
    }
}
