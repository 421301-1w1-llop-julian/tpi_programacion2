# Frontend - Single Page Application

Esta es una Single Page Application (SPA) construida con JavaScript vanilla, HTML y Tailwind CSS.

## Características

- ✅ Autenticación (Login/Registro)
- ✅ Vista Home con carrusel de películas
- ✅ Vista de Películas con búsqueda y filtros
- ✅ Detalles de películas
- ✅ Candy Shop con carrito de compras
- ✅ Proceso de compra de entradas (multi-paso)
- ✅ Dashboard administrativo con analíticas
- ✅ CRUD para películas, productos, funciones, actores, directores e idiomas
- ✅ Validación de formularios
- ✅ Protección contra XSS (sanitización de inputs)

## Configuración

### 1. Configurar URL del Backend

Edita el archivo `js/api.js` y actualiza la constante `API_BASE_URL` con la URL de tu backend:

```javascript
const API_BASE_URL = 'https://localhost:7285/api'; // Ajusta según tu backend
```

### 2. Configurar CORS en el Backend

Para que el frontend pueda comunicarse con el backend, necesitas agregar CORS en `Program.cs`:

```csharp
// Agregar después de builder.Services.AddControllers();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5500", "http://127.0.0.1:5500", "file://")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Agregar antes de app.UseAuthentication();
app.UseCors("AllowFrontend");
```

### 3. Ejecutar la Aplicación

Puedes usar cualquier servidor HTTP local:

**Opción 1: Live Server (VS Code)**
- Instala la extensión "Live Server"
- Click derecho en `index.html` → "Open with Live Server"

**Opción 2: Python**
```bash
python -m http.server 5500
```

**Opción 3: Node.js (http-server)**
```bash
npx http-server -p 5500
```

Luego abre `http://localhost:5500` en tu navegador.

## Estructura de Archivos

```
frontend/
├── index.html          # Página principal (SPA)
├── js/
│   ├── api.js         # Funciones de API
│   ├── auth.js        # Gestión de autenticación
│   ├── router.js      # Router de la SPA
│   ├── utils.js       # Utilidades y validaciones
│   └── app.js         # Vistas y lógica principal
└── README.md          # Este archivo
```

## Rutas Disponibles

- `/` - Home
- `/login` - Iniciar sesión
- `/register` - Registrarse
- `/peliculas` - Lista de películas
- `/peliculas/:id` - Detalles de película
- `/candy` - Candy shop
- `/candy/:id` - Detalles de producto
- `/comprar` - Proceso de compra
- `/dashboard` - Dashboard admin (solo administradores)
- `/dashboard/:section` - Secciones CRUD del dashboard

## Notas de Seguridad

- Todos los inputs son sanitizados para prevenir XSS
- Las validaciones de formularios están implementadas en `utils.js`
- El backend debe usar Entity Framework (parameterized queries) para prevenir SQL injection
- Los tokens JWT se almacenan en localStorage (considera usar httpOnly cookies en producción)

## Diseño

El diseño está inspirado en Cinemark Hoyts con:
- Fondo oscuro (#0A0A0A)
- Acentos rojos (#DC2626)
- Tipografía moderna y legible
- Navegación sticky siempre visible

