# Prompt para probar API TiposUsuario desde Postman

Copia y pega este prompt completo a tu GPT:

---

**PROMPT:**

Necesito que me ayudes a crear una colección de Postman para probar una API REST de .NET Core que gestiona Tipos de Usuario. La API está corriendo en `http://localhost:5024` (o `https://localhost:7285`).

La API tiene los siguientes endpoints en el controlador `TiposUsuario`:

**Base URL:** `http://localhost:5024/api/TiposUsuario`

**Endpoints disponibles:**

1. **GET /api/TiposUsuario** - Obtener todos los tipos de usuario
   - Método: GET
   - Headers: `Content-Type: application/json`
   - Respuesta esperada: Array de objetos con `IdTipoUsuario`, `TipoUsuario`, `Descripcion`
   - Status code: 200 OK

2. **GET /api/TiposUsuario/{id}** - Obtener un tipo de usuario por ID
   - Método: GET
   - Headers: `Content-Type: application/json`
   - Parámetro de ruta: `id` (número entero)
   - Respuesta esperada: Objeto con `IdTipoUsuario`, `TipoUsuario`, `Descripcion`
   - Status codes: 200 OK (encontrado), 404 Not Found (no existe)

3. **POST /api/TiposUsuario** - Crear un nuevo tipo de usuario
   - Método: POST
   - Headers: `Content-Type: application/json`
   - Body (JSON):
     ```json
     {
       "tipoUsuario": "string (requerido, máximo 50 caracteres)",
       "descripcion": "string (opcional, máximo 200 caracteres)"
     }
     ```
   - Ejemplo de body:
     ```json
     {
       "tipoUsuario": "Cliente",
       "descripcion": "Usuario cliente del sistema"
     }
     ```
   - Respuesta esperada: Objeto creado con `IdTipoUsuario`, `TipoUsuario`, `Descripcion`
   - Status code: 201 Created (con header Location)
   - Errores posibles: 400 Bad Request (si falta TipoUsuario o es inválido)

4. **PUT /api/TiposUsuario/{id}** - Actualizar un tipo de usuario existente
   - Método: PUT
   - Headers: `Content-Type: application/json`
   - Parámetro de ruta: `id` (número entero)
   - Body (JSON): Mismo formato que POST
   - Ejemplo de body:
     ```json
     {
       "tipoUsuario": "Cliente Premium",
       "descripcion": "Usuario cliente premium con beneficios adicionales"
     }
     ```
   - Respuesta esperada: 204 No Content (si se actualizó correctamente)
   - Status codes: 204 No Content (éxito), 404 Not Found (ID no existe), 400 Bad Request (datos inválidos)

5. **DELETE /api/TiposUsuario/{id}** - Eliminar un tipo de usuario
   - Método: DELETE
   - Headers: `Content-Type: application/json`
   - Parámetro de ruta: `id` (número entero)
   - Respuesta esperada: 204 No Content (si se eliminó correctamente)
   - Status codes: 204 No Content (éxito), 404 Not Found (ID no existe)

**Tareas que necesito:**

1. Crea una colección de Postman con estos 5 endpoints
2. Para cada endpoint, configura correctamente:
   - El método HTTP
   - La URL completa con variables si es necesario
   - Los headers apropiados
   - Los bodies JSON para POST y PUT con ejemplos realistas
   - Variables de colección para la base URL

3. Para el endpoint GET by ID, crea al menos 2 requests de ejemplo:
   - Una con un ID que probablemente exista (ej: 1)
   - Una con un ID que probablemente no exista (ej: 999)

4. Para POST y PUT, incluye ejemplos de body válidos y también un ejemplo de body inválido (sin el campo requerido) para probar validación

5. Organiza los requests en carpetas si es posible:
   - GET (obtener)
   - POST (crear)
   - PUT (actualizar)
   - DELETE (eliminar)

6. Añade una descripción breve a cada request explicando qué hace

**Notas importantes:**
- Los nombres de las propiedades en JSON son case-sensitive y deben ser exactamente: `tipoUsuario` y `descripcion` (camelCase)
- La API no requiere autenticación para estos endpoints (según el código)
- Las validaciones del servidor requieren que `tipoUsuario` sea obligatorio y tenga máximo 50 caracteres
- `descripcion` es opcional pero si se envía, máximo 200 caracteres

Por favor, dame instrucciones paso a paso para crear esta colección en Postman, o si puedes, genera el archivo JSON de la colección directamente.

---

