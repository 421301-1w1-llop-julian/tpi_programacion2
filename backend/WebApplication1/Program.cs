using System.Text;
using Cine2025.Repositories;
using Cine2025.Repositories.Interfaces;
using Cine2025.Services; 
using Cine2025.Services.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using WebApplication1.Helpers;
using WebApplication1.Models;
using WebApplication1.Repositories;
using WebApplication1.Repositories.Interfaces;
using WebApplication1.Services;
using WebApplication1.Services.Interfaces;

var builder = WebApplication.CreateBuilder(args);

// --- JWT Settings ---
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));
var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>();

// --- DbContext ---
builder.Services.AddDbContext<CINE_2025_1W1_GRUPO_5Context>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"))
);

// --- Repositories ---
builder.Services.AddScoped<IUsuarioRepository, UsuarioRepository>();
builder.Services.AddScoped<ITiposUsuarioRepository, TiposUsuarioRepository>();
// --- AÑADIDOS PARA RESERVAS ---
builder.Services.AddScoped<ICompraRepository, CompraRepository>();

// --- Services ---
builder.Services.AddScoped<IUsuarioService, UsuarioService>();
builder.Services.AddScoped<ITiposUsuarioService, TiposUsuarioService>();
// --- AÑADIDOS PARA RESERVAS ---
builder.Services.AddScoped<ICompraService, CompraService>();

// --- JWT Authentication ---
builder
    .Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = false; // en prod true
        options.SaveToken = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings.Issuer,
            ValidAudience = jwtSettings.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Secret)),
            ClockSkew = TimeSpan.Zero,
        };
        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = context =>
            {
                // Si la autenticación falla (token caducado, firma inválida, etc.)
                // Establece el estado de respuesta a 401 Unauthorized y detiene el procesamiento
                context.Response.StatusCode = 401;
                context.Response.ContentType = "application/json";
                // Puedes personalizar el cuerpo aquí para mayor claridad, pero 401 es suficiente.
                context.Response.WriteAsync("{\"error\":\"Token de autenticación inválido o caducado.\"}");
                context.Fail("Token de autenticación inválido o caducado.");
                return Task.CompletedTask;
            }
        };
    });

// --- Controllers & Swagger ---
builder.Services.AddControllers();
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireClaim("IdTipoUsuario", "1"));
});
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// --- Middleware pipeline ---
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// 1. Usa Routing (Identifica a dónde va la petición: /api/Compras)
app.UseRouting();

// 2. Usa Authentication (Lee el token 'Bearer' y extrae el ID)
app.UseAuthentication();

// 3. Usa Authorization (Aplica la restricción [Authorize] a la ruta)
app.UseAuthorization(); // <--- ¡Esta línea es la más crítica!

// 4. Mapea Controllers (Ejecuta el código del ComprasController)
app.MapControllers();

app.Run();