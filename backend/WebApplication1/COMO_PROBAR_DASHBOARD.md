# Guía para Probar el Dashboard con Postman

## Pasos para Probar el Dashboard

### 1. Iniciar el Backend

Primero, asegúrate de que el backend esté corriendo:
```bash
cd backend/WebApplication1
dotnet run
```

Por defecto, la API debería estar disponible en `https://localhost:5001` o `http://localhost:5000` (verifica en `launchSettings.json`).

### 2. Autenticarse (Obtener Token JWT)

**Endpoint:** `POST /api/Auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "username": "tu_usuario_admin",
  "password": "tu_password"
}
```

**Ejemplo de respuesta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "idUsuario": 1,
    "username": "admin",
    "email": "admin@example.com",
    "idTipoUsuario": 1
  }
}
```

**⚠️ IMPORTANTE:** Copia el token de la respuesta. Lo necesitarás para todas las peticiones al dashboard.

### 3. Probar los Endpoints del Dashboard

Todos los endpoints del dashboard requieren autenticación. Agrega el token en el header `Authorization`.

**Headers para todas las peticiones:**
```
Authorization: Bearer {tu_token_aqui}
Content-Type: application/json
```

---

## Endpoints Disponibles

### 3.1. Dashboard Completo

**Endpoint:** `GET /api/Dashboard`

**Ejemplos de uso:**

#### Sin filtros (todos los registros):
```
GET https://localhost:5001/api/Dashboard
```

#### Con filtros por fecha:
```
GET https://localhost:5001/api/Dashboard?fechaDesde=2025-01-01&fechaHasta=2025-12-31
```

#### Filtrar por película:
```
GET https://localhost:5001/api/Dashboard?IdPelicula=5
```

#### Solo películas más vistas (sin otros datos):
```
GET https://localhost:5001/api/Dashboard?soloPeliculasMasVistas=true&TopPeliculas=10
```

#### Múltiples filtros:
```
GET https://localhost:5001/api/Dashboard?fechaDesde=2025-01-01&fechaHasta=2025-12-31&IdPelicula=5&IdCliente=10
```

**Respuesta esperada:**
```json
{
  "totalReservas": 150,
  "totalCompras": 200,
  "totalFunciones": 50,
  "totalPeliculas": 25,
  "ingresosTotales": 15000.50,
  "peliculasMasVistas": [
    {
      "idPelicula": 5,
      "nombre": "Inception",
      "totalVistas": 120,
      "totalReservas": 80,
      "totalCompras": 40,
      "ingresosTotales": 5000.00
    }
  ],
  "reservas": [...],
  "compras": [...],
  "funciones": [...]
}
```

---

### 3.2. Películas Más Vistas

**Endpoint:** `GET /api/Dashboard/peliculas-mas-vistas`

**Ejemplos:**

#### Top 10 películas más vistas:
```
GET https://localhost:5001/api/Dashboard/peliculas-mas-vistas?top=10
```

#### Películas más vistas en un rango de fechas:
```
GET https://localhost:5001/api/Dashboard/peliculas-mas-vistas?top=5&fechaDesde=2025-01-01&fechaHasta=2025-03-31
```

**Respuesta esperada:**
```json
[
  {
    "idPelicula": 5,
    "nombre": "Inception",
    "totalVistas": 120,
    "totalReservas": 80,
    "totalCompras": 40,
    "ingresosTotales": 5000.00
  },
  {
    "idPelicula": 3,
    "nombre": "The Matrix",
    "totalVistas": 100,
    "totalReservas": 60,
    "totalCompras": 40,
    "ingresosTotales": 4000.00
  }
]
```

---

### 3.3. Lista de Reservas

**Endpoint:** `GET /api/Dashboard/reservas`

**Ejemplos:**

#### Todas las reservas:
```
GET https://localhost:5001/api/Dashboard/reservas
```

#### Reservas de un cliente específico:
```
GET https://localhost:5001/api/Dashboard/reservas?IdCliente=10
```

#### Reservas de una película específica:
```
GET https://localhost:5001/api/Dashboard/reservas?IdPelicula=5
```

#### Reservas en un rango de fechas:
```
GET https://localhost:5001/api/Dashboard/reservas?fechaDesde=2025-01-01&fechaHasta=2025-12-31
```

---

### 3.4. Lista de Compras

**Endpoint:** `GET /api/Dashboard/compras`

**Ejemplos:**

#### Todas las compras:
```
GET https://localhost:5001/api/Dashboard/compras
```

#### Compras de un cliente:
```
GET https://localhost:5001/api/Dashboard/compras?IdCliente=10
```

#### Compras de una película:
```
GET https://localhost:5001/api/Dashboard/compras?IdPelicula=5
```

---

### 3.5. Lista de Funciones

**Endpoint:** `GET /api/Dashboard/funciones`

**Ejemplos:**

#### Todas las funciones:
```
GET https://localhost:5001/api/Dashboard/funciones
```

#### Funciones de una película:
```
GET https://localhost:5001/api/Dashboard/funciones?IdPelicula=5
```

#### Funciones de una sala:
```
GET https://localhost:5001/api/Dashboard/funciones?IdSala=3
```

#### Funciones en un rango de fechas:
```
GET https://localhost:5001/api/Dashboard/funciones?fechaDesde=2025-01-01&fechaHasta=2025-12-31
```

---

## Parámetros de Filtro Disponibles

Todos los endpoints del dashboard aceptan estos parámetros de query string:

| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `fechaDesde` | DateTime | Fecha de inicio del filtro | `2025-01-01` |
| `fechaHasta` | DateTime | Fecha de fin del filtro | `2025-12-31` |
| `IdPelicula` | int | Filtrar por ID de película | `5` |
| `IdCliente` | int | Filtrar por ID de cliente | `10` |
| `IdSala` | int | Filtrar por ID de sala | `3` |
| `TopPeliculas` | int | Número de películas a mostrar en el ranking | `10` |
| `soloPeliculasMasVistas` | bool | Solo mostrar películas más vistas (sin otros datos) | `true` |

---

## Configuración en Postman

### Opción 1: Headers Manuales

1. Abre Postman
2. Crea una nueva petición
3. Selecciona el método HTTP (GET, POST, etc.)
4. Ingresa la URL
5. Ve a la pestaña **Headers**
6. Agrega:
   - Key: `Authorization`
   - Value: `Bearer {tu_token}`
   - Key: `Content-Type`
   - Value: `application/json`

### Opción 2: Variables de Entorno en Postman

1. Crea un nuevo entorno en Postman
2. Agrega una variable `token` con el valor de tu JWT
3. En la pestaña **Authorization**, selecciona **Bearer Token**
4. En el campo Token, escribe: `{{token}}`

Esto te permitirá actualizar el token una sola vez y usarlo en todas las peticiones.

---

## Ejemplo Completo en Postman

### Paso 1: Login
```
POST https://localhost:5001/api/Auth/login
Headers: Content-Type: application/json
Body:
{
  "username": "admin",
  "password": "tu_password"
}
```

### Paso 2: Copiar el token de la respuesta

### Paso 3: Dashboard Completo
```
GET https://localhost:5001/api/Dashboard
Headers:
  Authorization: Bearer {token_copiado}
  Content-Type: application/json
```

---

## Troubleshooting

### Error 401 Unauthorized
- Verifica que el token esté correctamente formateado: `Bearer {token}`
- Verifica que el token no haya expirado (son válidos por 60 minutos)
- Asegúrate de que el usuario tenga `IdTipoUsuario = 1` (administrador)

### Error 500 Internal Server Error
- Verifica que la base de datos esté corriendo
- Revisa los logs del servidor para más detalles
- Asegúrate de que todas las tablas necesarias existan

### No se muestran datos
- Verifica que haya datos en la base de datos
- Revisa que los filtros no sean demasiado restrictivos
- Asegúrate de que las relaciones entre tablas estén correctas

---

## Notas Importantes

1. **Puerto del servidor**: Verifica en `launchSettings.json` cuál es el puerto correcto (puede ser 5000, 5001, o otro).

2. **HTTPS**: Si usas HTTPS, asegúrate de desactivar la validación de certificados en Postman o configurar el certificado correctamente.

3. **Token JWT**: Los tokens expiran después de 60 minutos. Si recibes un 401, probablemente necesitas hacer login nuevamente.

4. **Usuario Administrador**: Solo los usuarios con `IdTipoUsuario = 1` pueden acceder al dashboard.

