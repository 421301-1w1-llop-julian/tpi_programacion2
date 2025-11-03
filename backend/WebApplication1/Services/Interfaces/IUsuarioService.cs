using Cine2025.DTOs;
using WebApplication1.DTOs.Usuario;

namespace Cine2025.Services.Interfaces
{
    public interface IUsuarioService
    {
        Task<UserDTO> CreateAsync(UserCreateDTO dto);
        Task<UserDTO> GetByIdAsync(int id);
        Task<IEnumerable<UserDTO>> GetAllAsync();
        Task<UserDTO> UpdateAsync(int id, UserUpdateDTO dto);
        Task<bool> DeleteAsync(int id);
        Task<AuthResponseDTO> AuthenticateAsync(AuthRequestDTO dto);
    }
}
