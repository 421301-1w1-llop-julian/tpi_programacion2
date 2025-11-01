using Cine2025.DTOs;

namespace Cine2025.Services.Interfaces
{
    public interface IUsuarioService
    {
        Task<UsuarioRespuestaDto?> LoginAsync(UsuarioLoginDto dto);
        Task<UsuarioRespuestaDto> RegistrarAsync(UsuarioRegistroDto dto);
    }
}
