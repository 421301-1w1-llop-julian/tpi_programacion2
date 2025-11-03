using System.ComponentModel.DataAnnotations;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Cine2025.DTOs;
using Cine2025.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using WebApplication1.DTOs.Usuario;
using WebApplication1.Helpers;
using WebApplication1.Models;

namespace Cine2025.Repositories
{
    public class UsuarioRepository : IUsuarioRepository
    {
        private readonly CINE_2025_1W1_GRUPO_5Context _db;
        private readonly JwtSettings _jwtSettings;

        public UsuarioRepository(CINE_2025_1W1_GRUPO_5Context db, IOptions<JwtSettings> jwtOptions)
        {
            _db = db ?? throw new ArgumentNullException(nameof(db));
            _jwtSettings = jwtOptions?.Value ?? throw new ArgumentNullException(nameof(jwtOptions));
        }

        // ---------------- CREATE ----------------
        public async Task<UserDTO> CreateAsync(UserCreateDTO dto)
        {
            if (dto == null)
                throw new ArgumentNullException(nameof(dto));

            if (string.IsNullOrWhiteSpace(dto.Username))
                throw new ArgumentException("El username es obligatorio.");

            if (string.IsNullOrWhiteSpace(dto.Email))
                throw new ArgumentException("El email es obligatorio.");

            if (!new EmailAddressAttribute().IsValid(dto.Email))
                throw new ArgumentException("El formato del email es inválido.");

            if (string.IsNullOrWhiteSpace(dto.Password) || dto.Password.Length < 8)
                throw new ArgumentException("La contraseña debe tener al menos 8 caracteres.");

            string username = dto.Username.Trim().ToLower();
            string email = dto.Email.Trim().ToLower();

            if (await _db.Usuarios.AnyAsync(u => u.Username.ToLower() == username))
                throw new InvalidOperationException("El username ya está en uso.");

            if (await _db.Usuarios.AnyAsync(u => u.Email.ToLower() == email))
                throw new InvalidOperationException("El email ya está en uso.");

            if (!await _db.TiposUsuarios.AnyAsync(t => t.IdTipoUsuario == dto.IdTipoUsuario))
                throw new InvalidOperationException("El tipo de usuario especificado no existe.");

            var hashed = BCrypt.Net.BCrypt.HashPassword(dto.Password);

            var entity = new Usuario
            {
                Username = dto.Username.Trim(),
                Password = hashed,
                Nombre = dto.Nombre?.Trim(),
                Apellido = dto.Apellido?.Trim(),
                Email = dto.Email.Trim(),
                IdTipoUsuario = dto.IdTipoUsuario,
                FechaCreacion = DateTime.UtcNow,
                Activo = true,
            };

            _db.Usuarios.Add(entity);
            await _db.SaveChangesAsync();

            return MapToDto(entity);
        }

        // ---------------- READ by ID ----------------
        public async Task<UserDTO> GetByIdAsync(int id)
        {
            if (id <= 0)
                throw new ArgumentException("El ID debe ser mayor que 0.");

            var u = await _db.Usuarios.AsNoTracking().FirstOrDefaultAsync(x => x.IdUsuario == id);
            if (u == null)
                return null;

            return MapToDto(u);
        }

        // ---------------- READ ALL ----------------
        public async Task<IEnumerable<UserDTO>> GetAllAsync()
        {
            var users = await _db.Usuarios.AsNoTracking().ToListAsync();

            if (users == null || users.Count == 0)
                return Enumerable.Empty<UserDTO>();

            return users.Select(MapToDto);
        }

        // ---------------- UPDATE ----------------
        public async Task<UserDTO> UpdateAsync(int id, UserUpdateDTO dto)
        {
            if (dto == null)
                throw new ArgumentNullException(nameof(dto));

            if (id <= 0)
                throw new ArgumentException("El ID debe ser válido.");

            var u = await _db.Usuarios.FindAsync(id);
            if (u == null)
                throw new KeyNotFoundException("Usuario no encontrado.");

            // Validar nuevo email duplicado
            if (!string.IsNullOrWhiteSpace(dto.Email))
            {
                if (!new EmailAddressAttribute().IsValid(dto.Email))
                    throw new ArgumentException("Formato de email inválido.");

                string newEmail = dto.Email.Trim().ToLower();
                bool emailExists = await _db.Usuarios.AnyAsync(x =>
                    x.Email.ToLower() == newEmail && x.IdUsuario != id
                );
                if (emailExists)
                    throw new InvalidOperationException(
                        "El email ya está en uso por otro usuario."
                    );

                u.Email = dto.Email.Trim();
            }

            // Validar tipo de usuario
            if (dto.IdTipoUsuario.HasValue)
            {
                bool tipoExists = await _db.TiposUsuarios.AnyAsync(t =>
                    t.IdTipoUsuario == dto.IdTipoUsuario.Value
                );
                if (!tipoExists)
                    throw new InvalidOperationException(
                        "El tipo de usuario especificado no existe."
                    );

                u.IdTipoUsuario = dto.IdTipoUsuario.Value;
            }

            if (!string.IsNullOrWhiteSpace(dto.Nombre))
                u.Nombre = dto.Nombre.Trim();

            if (!string.IsNullOrWhiteSpace(dto.Apellido))
                u.Apellido = dto.Apellido.Trim();

            if (!string.IsNullOrWhiteSpace(dto.Password))
            {
                if (dto.Password.Length < 8)
                    throw new ArgumentException("La contraseña debe tener al menos 8 caracteres.");
                u.Password = BCrypt.Net.BCrypt.HashPassword(dto.Password);
            }

            _db.Usuarios.Update(u);
            await _db.SaveChangesAsync();

            return MapToDto(u);
        }

        // ---------------- DELETE ----------------
        public async Task<bool> DeleteAsync(int id)
        {
            if (id <= 0)
                throw new ArgumentException("El ID debe ser válido.");

            var u = await _db.Usuarios.FindAsync(id);
            if (u == null)
                return false;

            // Proteger eliminación de administradores base, si aplica
            var tipo = await _db.TiposUsuarios.FindAsync(u.IdTipoUsuario);
            if (tipo?.TipoUsuario?.ToLower() == "admin")
                throw new InvalidOperationException(
                    "No se puede eliminar el usuario administrador."
                );

            // Soft delete (recomendado)
            u.Activo = false;

            _db.Usuarios.Update(u);
            await _db.SaveChangesAsync();

            return true;
        }

        // ---------------- AUTHENTICATE ----------------
        public async Task<AuthResponseDTO> AuthenticateAsync(AuthRequestDTO dto)
        {
            if (dto == null)
                throw new ArgumentNullException(nameof(dto));

            if (string.IsNullOrWhiteSpace(dto.Username) || string.IsNullOrWhiteSpace(dto.Password))
                throw new ArgumentException("Username y contraseña son obligatorios.");

            var username = dto.Username.Trim().ToLower();
            var user = await _db.Usuarios.SingleOrDefaultAsync(u =>
                u.Username.ToLower() == username
            );

            if (user == null)
                return null;
            if ((bool)!user.Activo)
                return null;

            bool verified = BCrypt.Net.BCrypt.Verify(dto.Password, user.Password);
            if (!verified)
                return null;

            var tipo = await _db.TiposUsuarios.FindAsync(user.IdTipoUsuario);
            var token = GenerateJwtToken(user, tipo?.TipoUsuario);

            return new AuthResponseDTO
            {
                Token = token,
                ExpiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpiryMinutes),
                User = MapToDto(user),
            };
        }

        // ---------------- JWT GENERATION ----------------
        private string GenerateJwtToken(Usuario user, string role)
        {
            if (string.IsNullOrEmpty(_jwtSettings.Secret) || _jwtSettings.Secret.Length < 32)
                throw new InvalidOperationException("La clave JWT es inválida o demasiado corta.");

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.Secret));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.IdUsuario.ToString()),
                new Claim(JwtRegisteredClaimNames.UniqueName, user.Username ?? ""),
                new Claim(ClaimTypes.NameIdentifier, user.IdUsuario.ToString()),
                new Claim(ClaimTypes.Name, user.Username ?? ""),
                new Claim("IdTipoUsuario", user.IdTipoUsuario.ToString()), // 👈 agrega el tipo de usuario al token
            };

            if (!string.IsNullOrEmpty(role))
                claims.Add(new Claim(ClaimTypes.Role, role));

            var token = new JwtSecurityToken(
                issuer: _jwtSettings.Issuer,
                audience: _jwtSettings.Audience,
                claims: claims,
                notBefore: DateTime.UtcNow,
                expires: DateTime.UtcNow.AddMinutes(_jwtSettings.ExpiryMinutes),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        // ---------------- DTO MAPPING ----------------
        private static UserDTO MapToDto(Usuario u)
        {
            return new UserDTO
            {
                IdUsuario = u.IdUsuario,
                Username = u.Username,
                Nombre = u.Nombre,
                Apellido = u.Apellido,
                Email = u.Email,
                IdTipoUsuario = u.IdTipoUsuario,
                Activo = u.Activo,
            };
        }
    }
}
