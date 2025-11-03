// Controllers/UsersController.cs
using Cine2025.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApplication1.DTOs.Usuario;

[ApiController]
[Route("api/[controller]")]
[Authorize] // exige JWT en todas las rutas por defecto
public class UsuariosController : ControllerBase
{
    private readonly IUsuarioService _userService;
    public UsuariosController(IUsuarioService userService)
    {
        _userService = userService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var users = await _userService.GetAllAsync();
        return Ok(users);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        var user = await _userService.GetByIdAsync(id);
        if (user == null) return NotFound();
        return Ok(user);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UserUpdateDTO dto)
    {
        var user = await _userService.UpdateAsync(id, dto);
        if (user == null) return NotFound();
        return Ok(user);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var ok = await _userService.DeleteAsync(id);
        if (!ok) return NotFound();
        return NoContent();
    }
}
