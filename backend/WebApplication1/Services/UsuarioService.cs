// Services/UserService.cs
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;
using Cine2025.DTOs;
using Cine2025.Repositories.Interfaces;
using Cine2025.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using WebApplication1.DTOs.Usuario;
using WebApplication1.Helpers;
using WebApplication1.Models;

namespace WebApplication1.Services
{
    public class UsuarioService : IUsuarioService
    {
        private readonly IUsuarioRepository _usuarioRepository;

        public UsuarioService(IUsuarioRepository usuarioRepository)
        {
            _usuarioRepository = usuarioRepository;
        }

        public async Task<UserDTO> CreateAsync(UserCreateDTO dto)
        {
            // Aquí podrías agregar validaciones de negocio antes de crear el usuario
            return await _usuarioRepository.CreateAsync(dto);
        }

        public async Task<UserDTO> GetByIdAsync(int id)
        {
            return await _usuarioRepository.GetByIdAsync(id);
        }

        public async Task<IEnumerable<UserDTO>> GetAllAsync()
        {
            return await _usuarioRepository.GetAllAsync();
        }

        public async Task<UserDTO> UpdateAsync(int id, UserUpdateDTO dto)
        {
            // Podrías agregar validaciones, por ejemplo, que no cambie su rol sin permisos
            return await _usuarioRepository.UpdateAsync(id, dto);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            // Podrías hacer una validación para evitar borrar ciertos usuarios
            return await _usuarioRepository.DeleteAsync(id);
        }

        public async Task<AuthResponseDTO> AuthenticateAsync(AuthRequestDTO dto)
        {
            // Aquí podrías agregar lógica de bloqueo de cuenta o intentos fallidos
            return await _usuarioRepository.AuthenticateAsync(dto);
        }
    }
}
