using Cine2025.DTOs;
using Cine2025.Repositories.Interfaces;
using Cine2025.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using WebApplication1.Models;

namespace Cine2025.Services
{
    public class UsuarioService : IUsuarioService
    {
        private readonly IUsuariosRepository _repo;
        private readonly PasswordHasher<Usuario> _hasher = new();

        public UsuarioService(IUsuariosRepository repo)
        {
            _repo = repo;
        }

        public async Task<UsuarioRespuestaDto?> LoginAsync(UsuarioLoginDto dto)
        {
            var usuario = await _repo.GetByUsernameAsync(dto.Username);
            if (usuario == null) return null;

            var result = _hasher.VerifyHashedPassword(usuario, usuario.Password, dto.Password);
            if (result == PasswordVerificationResult.Failed) return null;

            return new UsuarioRespuestaDto
            {
                IdUsuario = usuario.IdUsuario,
                Username = usuario.Username,
                NombreCompleto = $"{usuario.Nombre} {usuario.Apellido}",
                Email = usuario.Email,
                TipoUsuario = usuario.IdTipoUsuarioNavigation.TipoUsuario
            };
        }

        public async Task<UsuarioRespuestaDto> RegistrarAsync(UsuarioRegistroDto dto)
        {
            var usuario = new Usuario
            {
                Username = dto.Username,
                Password = _hasher.HashPassword(null, dto.Password),
                Nombre = dto.Nombre,
                Apellido = dto.Apellido,
                Email = dto.Email,
                IdTipoUsuario = 2, // Cliente
                Activo = true,
                FechaCreacion = DateTime.Now
            };

            await _repo.AddAsync(usuario);

            return new UsuarioRespuestaDto
            {
                IdUsuario = usuario.IdUsuario,
                Username = usuario.Username,
                NombreCompleto = $"{usuario.Nombre} {usuario.Apellido}",
                Email = usuario.Email,
                TipoUsuario = "Cliente"
            };
        }
    }
}
