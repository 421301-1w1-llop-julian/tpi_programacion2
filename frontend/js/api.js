// API Configuration
// Update this URL to match your backend API URL
// Default ports: https://localhost:7285 or http://localhost:5024
const API_BASE_URL = "https://localhost:7285/api"; // Adjust to your backend URL

// Helper function to get auth token
function getAuthToken() {
    return localStorage.getItem("token");
}

// Helper function to get headers
function getHeaders(includeAuth = true) {
    const headers = {
        "Content-Type": "application/json",
    };
    if (includeAuth) {
        const token = getAuthToken();
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }
    }
    return headers;
}

// API Functions
const api = {
    // Auth
    async register(data) {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: "POST",
            headers: getHeaders(false),
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Error al registrar");
        }
        return await response.json();
    },

    async login(data) {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: getHeaders(false),
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Credenciales inválidas");
        }
        return await response.json();
    },

    // Movies
    async getMovies(filters = {}) {
        const params = new URLSearchParams();
        // Only append defined filters
        Object.keys(filters || {}).forEach((k) => {
            const v = filters[k];
            if (v !== undefined && v !== null && String(v) !== "")
                params.append(k, v);
        });

        const url = params.toString()
            ? `${API_BASE_URL}/Pelicula?${params.toString()}`
            : `${API_BASE_URL}/Pelicula`;

        const response = await fetch(url, {
            headers: getHeaders(false),
        });
        if (!response.ok) throw new Error("Error al cargar películas");
        return await response.json();
    },
    async getMovie(id) {
        const response = await fetch(`${API_BASE_URL}/Pelicula/${id}`, {
            headers: getHeaders(false),
        });
        if (!response.ok) throw new Error("Error al cargar película");
        return await response.json();
    },

    // Simple client-side search fallback: backend has no /search endpoint for Pelicula
    async searchMovies(query) {
        // Prefer server-side search when available (use PascalCase key to match backend)
        return await this.getMovies({ Search: query });
    },

    // Products
    async getProducts() {
        const response = await fetch(`${API_BASE_URL}/productos`, {
            headers: getHeaders(false),
        });
        if (!response.ok) throw new Error("Error al cargar productos");
        return await response.json();
    },

    async getProduct(id) {
        const response = await fetch(`${API_BASE_URL}/productos/${id}`, {
            headers: getHeaders(false),
        });
        if (!response.ok) throw new Error("Error al cargar producto");
        return await response.json();
    },

    // Functions
    async getFunctions(movieId = null) {
        const url = movieId
            ? `${API_BASE_URL}/funcion?peliculaId=${movieId}`
            : `${API_BASE_URL}/funcion`;
        const response = await fetch(url, {
            headers: getHeaders(false),
        });
        if (!response.ok) throw new Error("Error al cargar funciones");
        return await response.json();
    },

    async getFunction(id) {
        const response = await fetch(`${API_BASE_URL}/funcion/${id}`, {
            headers: getHeaders(false),
        });
        if (!response.ok) throw new Error("Error al cargar función");
        return await response.json();
    },

    async getSeats(functionId) {
        const response = await fetch(
            `${API_BASE_URL}/ButacasFuncion?funcionId=${functionId}`,
            {
                headers: getHeaders(false),
            }
        );
        if (!response.ok) throw new Error("Error al cargar butacas");

        return await response.json();
    },

    // Reservations
    async createReservation(data) {
        const response = await fetch(`${API_BASE_URL}/reservas`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(
                error.error || error.message || "Error al crear reserva"
            );
        }
        return await response.json();
    },

    // Purchases
    async createPurchase(data) {
        const response = await fetch(`${API_BASE_URL}/Compras`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(
                error.error || error.message || "Error al procesar la compra"
            );
        }
        return await response.json();
    },

    // Dashboard - Analytics
    async getAnalytics(filters = {}) {
        const params = new URLSearchParams();
        if (filters.fechaDesde) params.append("fechaDesde", filters.fechaDesde);
        if (filters.fechaHasta) params.append("fechaHasta", filters.fechaHasta);
        if (filters.idPelicula) params.append("idPelicula", filters.idPelicula);
        if (filters.idCliente) params.append("idCliente", filters.idCliente);
        if (filters.idSala) params.append("idSala", filters.idSala);
        
        const response = await fetch(
            `${API_BASE_URL}/Dashboard?${params}`,
            {
                headers: getHeaders(),
            }
        );
        if (!response.ok) throw new Error("Error al cargar analíticas");
        return await response.json();
    },

    async getCompras(filters = {}, pagina = null, tamañoPagina = null) {
        const params = new URLSearchParams();
        if (filters.fechaDesde) params.append("fechaDesde", filters.fechaDesde);
        if (filters.fechaHasta) params.append("fechaHasta", filters.fechaHasta);
        if (filters.idPelicula) params.append("idPelicula", filters.idPelicula);
        if (filters.idCliente) params.append("idCliente", filters.idCliente);
        
        // Agregar filtros de monto
        if (filters.montoMinimo !== undefined && filters.montoMinimo !== null && !isNaN(filters.montoMinimo)) {
            params.append("MontoMinimo", filters.montoMinimo.toString());
            console.log("Enviando MontoMinimo:", filters.montoMinimo);
        }
        if (filters.montoMaximo !== undefined && filters.montoMaximo !== null && !isNaN(filters.montoMaximo)) {
            params.append("MontoMaximo", filters.montoMaximo.toString());
            console.log("Enviando MontoMaximo:", filters.montoMaximo);
        }
        
        // Agregar parámetros de paginación solo si se proporcionan
        if (pagina !== null) {
            params.append("Pagina", pagina.toString());
        }
        if (tamañoPagina !== null) {
            params.append("TamañoPagina", tamañoPagina.toString());
        }
        
        const url = `${API_BASE_URL}/Dashboard/compras?${params}`;
        console.log("URL de petición:", url);
        
        const response = await fetch(url, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error("Error al cargar compras");
        return await response.json();
    },

    // Dashboard - CRUD Operations
    async createMovie(data) {
        const response = await fetch(`${API_BASE_URL}/Pelicula`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Error al crear película");
        }
        return await response.json();
    },

    async updateMovie(id, data) {
        console.log(`Updating movie ${id} at ${API_BASE_URL}/Pelicula/${id}`, data);
        const response = await fetch(`${API_BASE_URL}/Pelicula/${id}`, {
            method: "PUT",
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const errorText = await response.text();
            console.error("Update error:", response.status, errorText);
            throw new Error(`Error al actualizar película: ${response.status} ${errorText}`);
        }
        return await response.json();
    },

    async deleteMovie(id) {
        const response = await fetch(`${API_BASE_URL}/Pelicula/${id}`, {
            method: "DELETE",
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error("Error al eliminar película");
        return true;
    },

    async createProduct(data) {
        const response = await fetch(`${API_BASE_URL}/productos`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error("Error al crear producto");
        return await response.json();
    },

    async updateProduct(id, data) {
        console.log(`Updating product ${id} at ${API_BASE_URL}/productos/${id}`, data);
        const response = await fetch(`${API_BASE_URL}/productos/${id}`, {
            method: "PUT",
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            let errorText = "";
            try {
                // Intentar leer como texto primero
                errorText = await response.text();
                // Si el texto está vacío, usar el status
                if (!errorText) {
                    errorText = `Status ${response.status}`;
                }
            } catch (e) {
                errorText = `Status ${response.status}`;
            }
            console.error("Update error:", response.status, errorText);
            throw new Error(`Error al actualizar producto: ${response.status} ${errorText}`);
        }
        // El backend devuelve NoContent (204), no hay JSON que parsear
        // Verificar el status code y el content-type antes de intentar parsear
        if (response.status === 204) {
            // NoContent - no hay cuerpo en la respuesta
            return null;
        }
        // Si es 200, verificar si hay contenido JSON
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            const text = await response.text();
            return text ? JSON.parse(text) : null;
        }
        // Si no hay content-type JSON, retornar null
        return null;
    },

    async deleteProduct(id) {
        const response = await fetch(`${API_BASE_URL}/productos/${id}`, {
            method: "DELETE",
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error("Error al eliminar producto");
        return true;
    },

    async createFunction(data) {
        const response = await fetch(`${API_BASE_URL}/funcion`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error("Error al crear función");
        return await response.json();
    },

    async updateFunction(id, data) {
        const response = await fetch(`${API_BASE_URL}/funcion/${id}`, {
            method: "PUT",
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error("Error al actualizar función");
        return await response.json();
    },

    async deleteFunction(id) {
        const response = await fetch(`${API_BASE_URL}/funcion/${id}`, {
            method: "DELETE",
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error("Error al eliminar función");
        return true;
    },

    // Reference data
    async getGenres() {
        const response = await fetch(`${API_BASE_URL}/genero`, {
            headers: getHeaders(false),
        });
        if (!response.ok) throw new Error("Error al cargar géneros");
        return await response.json();
    },

    async getLanguages() {
        const response = await fetch(`${API_BASE_URL}/idioma`, {
            headers: getHeaders(false),
        });
        if (!response.ok) throw new Error("Error al cargar idiomas");
        return await response.json();
    },

    async getLanguage(id) {
        const response = await fetch(`${API_BASE_URL}/idioma/${id}`, {
            headers: getHeaders(false),
        });
        if (!response.ok) throw new Error("Error al cargar idioma");
        return await response.json();
    },

    async getClassifications() {
        const response = await fetch(`${API_BASE_URL}/Clasificaciones`, {
            headers: getHeaders(false),
        });
        if (!response.ok) throw new Error("Error al cargar clasificaciones");
        return await response.json();
    },

    async getAudienceTypes() {
        const response = await fetch(`${API_BASE_URL}/TiposPublico`, {
            headers: getHeaders(false),
        });
        if (!response.ok) throw new Error("Error al cargar tipos de público");
        return await response.json();
    },

    async getActors() {
        const response = await fetch(`${API_BASE_URL}/Actor`, {
            headers: getHeaders(false),
        });
        if (!response.ok) throw new Error("Error al cargar actores");
        return await response.json();
    },

    async getActor(id) {
        const response = await fetch(`${API_BASE_URL}/Actor/${id}`, {
            headers: getHeaders(false),
        });
        if (!response.ok) throw new Error("Error al cargar actor");
        return await response.json();
    },

    async getCountries() {
        const response = await fetch(`${API_BASE_URL}/pais`, {
            headers: getHeaders(false),
        });
        if (!response.ok) throw new Error("Error al cargar países");
        return await response.json();
    },

    async getProductTypes() {
        const response = await fetch(`${API_BASE_URL}/TiposProductos`, {
            headers: getHeaders(false),
        });
        if (!response.ok) throw new Error("Error al cargar tipos de producto");
        return await response.json();
    },

    async createActor(data) {
        const response = await fetch(`${API_BASE_URL}/Actor`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error("Error al crear actor");
        return await response.json();
    },

    async updateActor(id, data) {
        console.log(`Updating actor ${id} at ${API_BASE_URL}/Actor/${id}`, data);
        const response = await fetch(`${API_BASE_URL}/Actor/${id}`, {
            method: "PUT",
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            let errorText = "";
            try {
                errorText = await response.text();
                if (!errorText) {
                    errorText = `Status ${response.status}`;
                }
            } catch (e) {
                errorText = `Status ${response.status}`;
            }
            console.error("Update error:", response.status, errorText);
            throw new Error(`Error al actualizar actor: ${response.status} ${errorText}`);
        }
        // El backend devuelve NoContent (204), no hay JSON que parsear
        if (response.status === 204) {
            return null;
        }
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            const text = await response.text();
            return text ? JSON.parse(text) : null;
        }
        return null;
    },

    async deleteActor(id) {
        const response = await fetch(`${API_BASE_URL}/Actor/${id}`, {
            method: "DELETE",
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error("Error al eliminar actor");
        return true;
    },

    async getDirectors() {
        const response = await fetch(`${API_BASE_URL}/Director`, {
            headers: getHeaders(false),
        });
        if (!response.ok) throw new Error("Error al cargar directores");
        return await response.json();
    },

    async getDirector(id) {
        const response = await fetch(`${API_BASE_URL}/Director/${id}`, {
            headers: getHeaders(false),
        });
        if (!response.ok) throw new Error("Error al cargar director");
        return await response.json();
    },

    async getDistribuidoras() {
        const response = await fetch(`${API_BASE_URL}/Distribuidora`, {
            headers: getHeaders(false),
        });
        if (!response.ok) throw new Error("Error al cargar distribuidoras");
        return await response.json();
    },

    async createDirector(data) {
        const response = await fetch(`${API_BASE_URL}/Director`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error("Error al crear director");
        return await response.json();
    },

    async updateDirector(id, data) {
        const response = await fetch(`${API_BASE_URL}/Director/${id}`, {
            method: "PUT",
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error("Error al actualizar director");
        return await response.json();
    },

    async deleteDirector(id) {
        const response = await fetch(`${API_BASE_URL}/Director/${id}`, {
            method: "DELETE",
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error("Error al eliminar director");
        return true;
    },

    async createLanguage(data) {
        const response = await fetch(`${API_BASE_URL}/idioma`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error("Error al crear idioma");
        return await response.json();
    },

    async updateLanguage(id, data) {
        const response = await fetch(`${API_BASE_URL}/idioma/${id}`, {
            method: "PUT",
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error("Error al actualizar idioma");
        return await response.json();
    },

    async deleteLanguage(id) {
        const response = await fetch(`${API_BASE_URL}/idioma/${id}`, {
            method: "DELETE",
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error("Error al eliminar idioma");
        return true;
    },

    async getSalas() {
        // Nota: Este endpoint puede no existir aún en el backend
        // Si no existe, se puede crear o usar una alternativa
        try {
            const response = await fetch(`${API_BASE_URL}/Sala`, {
                headers: getHeaders(false),
            });
            if (!response.ok) {
                console.warn("Endpoint de salas no disponible, retornando array vacío");
                return [];
            }
            return await response.json();
        } catch (error) {
            console.warn("Error al cargar salas:", error);
            return [];
        }
    },
};
