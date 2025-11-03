// Services/UserService.cs
using BCrypt.Net;
using Cine2025.DTOs;
using Cine2025.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using WebApplication1.DTOs.Usuario;
using WebApplication1.Helpers;
using WebApplication1.Models;


public class UsuarioService : IUsuarioService
{
    private readonly CINE_2025_1W1_GRUPO_5Context _db;
    private readonly JwtSettings _jwtSettings;

    public UsuarioService(CINE_2025_1W1_GRUPO_5Context db, IOptions<JwtSettings> jwtOptions)
    {
        _db = db;
        _jwtSettings = jwtOptions.Value;
    }

    public async Task<UserDTO> CreateAsync(UserCreateDTO dto)
    {
        // comprobar si username/email ya existen
        if (await _db.Usuarios.AnyAsync(u => u.Username == dto.Username))
            throw new Exception("Username ya existe");

        if (await _db.Usuarios.AnyAsync(u => u.Email == dto.Email))
            throw new Exception("Email ya existe");

        var hashed = BCrypt.Net.BCrypt.HashPassword(dto.Password);

        var entity = new Usuario
        {
            Username = dto.Username,
            Password = hashed,
            Nombre = dto.Nombre,
            Apellido = dto.Apellido,
            Email = dto.Email,
            IdTipoUsuario = dto.IdTipoUsuario,
            FechaCreacion = DateTime.UtcNow,
            Activo = true
        };

        _db.Usuarios.Add(entity);
        await _db.SaveChangesAsync();

        return MapToDto(entity);
    }

    public async Task<UserDTO> GetByIdAsync(int id)
    {
        var u = await _db.Usuarios.FindAsync(id);
        if (u == null) return null;
        return MapToDto(u);
    }

    public async Task<IEnumerable<UserDTO>> GetAllAsync()
    {
        return await _db.Usuarios
            .Select(u => MapToDto(u))
            .ToListAsync();
    }

    public async Task<UserDTO> UpdateAsync(int id, UserUpdateDTO dto)
    {
        var u = await _db.Usuarios.FindAsync(id);
        if (u == null) return null;

        u.Nombre = dto.Nombre ?? u.Nombre;
        u.Apellido = dto.Apellido ?? u.Apellido;
        u.Email = dto.Email ?? u.Email;
        if (dto.IdTipoUsuario.HasValue) u.IdTipoUsuario = dto.IdTipoUsuario.Value;

        if (!string.IsNullOrWhiteSpace(dto.Password))
        {
            u.Password = BCrypt.Net.BCrypt.HashPassword(dto.Password);
        }

        _db.Usuarios.Update(u);
        await _db.SaveChangesAsync();

        return MapToDto(u);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var u = await _db.Usuarios.FindAsync(id);
        if (u == null) return false;
        _db.Usuarios.Remove(u);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<AuthResponseDTO> AuthenticateAsync(AuthRequestDTO dto)
    {
        var user = await _db.Usuarios.SingleOrDefaultAsync(u => u.Username == dto.Username);
        if (user == null) return null;

        bool verified = BCrypt.Net.BCrypt.Verify(dto.Password, user.Password);
        if (!verified) return null;

        // puedes traer el tipo de usuario si quieres rol
        var tipo = await _db.TiposUsuarios.FindAsync(user.IdTipoUsuario);

        var token = GenerateJwtToken(user, tipo?.TipoUsuario);

        return new AuthResponseDTO
        {
            Token = token,
            ExpiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpiryMinutes),
            User = MapToDto(user)
        };
    }

    private string GenerateJwtToken(Usuario user, string role)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.Secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.IdUsuario.ToString()),
            new Claim(JwtRegisteredClaimNames.UniqueName, user.Username ?? ""),
            new Claim(ClaimTypes.NameIdentifier, user.IdUsuario.ToString()),
            new Claim(ClaimTypes.Name, user.Username ?? "")
        };

        if (!string.IsNullOrEmpty(role))
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

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

    private static UserDTO MapToDto(Usuario u)
    {
        return new UserDTO
        {
            IdUsuario = u.IdUsuario,
            Username = u.Username,
            Nombre = u.Nombre,
            Apellido = u.Apellido,
            Email = u.Email,
            IdTipoUsuario = u.IdTipoUsuario
        };
    }
}
