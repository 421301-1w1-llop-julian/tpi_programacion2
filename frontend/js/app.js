// Main Application
document.addEventListener('DOMContentLoaded', () => {
    // Register all routes
    router.register('/', homeView);
    router.register('/login', loginView);
    router.register('/register', registerView);
    router.register('/peliculas', moviesView);
    router.register('/peliculas/:id', movieDetailView);
    router.register('/candy', candyView);
    router.register('/candy/:id', candyDetailView);
    router.register('/comprar', purchaseView);
    router.register('/dashboard', dashboardView);
    router.register('/dashboard/:section', dashboardSectionView);

    // Initialize router
    router.init();

    // Setup logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            auth.logout();
            router.navigate('/');
        });
    }

    // Setup navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const href = link.getAttribute('href');
            if (href) {
                router.navigate(href.replace('#', ''));
            }
        });
    });
});

// ==================== VIEWS ====================

// Home View
async function homeView() {
    const app = document.getElementById('app');
    auth.updateUI();

    let movies = [];
    let apiError = false;
    try {
        movies = await api.getMovies();
    } catch (error) {
        console.error('Error loading movies:', error);
        apiError = true;
    }

    app.innerHTML = `
        <div class="min-h-screen">
            <!-- Hero Section -->
            <div class="bg-gradient-to-b from-cine-gray to-cine-dark py-16">
                <div class="container mx-auto px-4">
                    <h1 class="text-5xl font-bold mb-4">Bienvenido a CineMark</h1>
                    <p class="text-xl text-gray-300 max-w-2xl">
                        Tu destino para las mejores películas en cartelera. Disfruta de una experiencia única 
                        en nuestras salas con la mejor calidad de imagen y sonido. Explora nuestra amplia 
                        selección de películas y productos exclusivos en nuestro candy shop.
                    </p>
                </div>
            </div>

            <!-- Movies Carousel -->
            <div class="container mx-auto px-4 py-12">
                <h2 class="text-3xl font-bold mb-8">Películas en Cartelera</h2>
                ${apiError ? `
                    <div class="bg-yellow-900 bg-opacity-50 border border-yellow-500 rounded-lg p-6 mb-6">
                        <p class="text-yellow-200">
                            ⚠️ No se pudo conectar con la API. Asegúrate de que el backend esté corriendo y que CORS esté configurado correctamente.
                        </p>
                        <p class="text-yellow-300 text-sm mt-2">
                            Revisa la consola del navegador (F12) para más detalles del error.
                        </p>
                    </div>
                ` : ''}
                ${movies.length === 0 && !apiError ? `
                    <div class="bg-gray-800 rounded-lg p-8 text-center">
                        <p class="text-gray-400 text-lg">No hay películas disponibles en este momento.</p>
                    </div>
                ` : ''}
                ${movies.length > 0 ? `
                <div class="relative">
                    <div id="carousel-container" class="overflow-hidden rounded-lg">
                        <div id="carousel-track" class="flex transition-transform duration-500 ease-in-out">
                            ${movies.slice(0, 10).map((movie, index) => `
                                <div class="carousel-item min-w-full ${index === 0 ? 'active' : ''}" data-index="${index}">
                                    <div class="bg-cine-gray rounded-lg p-6 flex items-center space-x-6">
                                        <div class="w-48 h-64 bg-gray-700 rounded flex-shrink-0 flex items-center justify-center">
                                            <span class="text-gray-400">Imagen</span>
                                        </div>
                                        <div class="flex-1">
                                            <h3 class="text-2xl font-bold mb-2">${sanitizeInput(movie.nombre || 'Sin título')}</h3>
                                            <p class="text-gray-300 mb-4 line-clamp-3">${sanitizeInput(movie.descripcion || 'Sin descripción')}</p>
                                            <div class="flex items-center space-x-4 text-sm text-gray-400">
                                                <span>${formatDuration(movie.duracion || 0)}</span>
                                                <span>•</span>
                                                <span>${formatDate(movie.fechaEstreno)}</span>
                                            </div>
                                            <a href="#/peliculas/${movie.idPelicula}" class="inline-block mt-4 bg-cine-red px-6 py-2 rounded hover:bg-red-700 transition">
                                                Ver Detalles
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    ${movies.length > 1 ? `
                        <button id="carousel-prev" class="absolute left-0 top-1/2 transform -translate-y-1/2 bg-cine-red p-3 rounded-full hover:bg-red-700 transition">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                            </svg>
                        </button>
                        <button id="carousel-next" class="absolute right-0 top-1/2 transform -translate-y-1/2 bg-cine-red p-3 rounded-full hover:bg-red-700 transition">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                            </svg>
                        </button>
                    ` : ''}
                </div>
                ${movies.length > 1 ? `
                <div class="flex justify-center mt-4 space-x-2">
                    ${movies.slice(0, 10).map((_, index) => `
                        <button class="carousel-dot w-2 h-2 rounded-full ${index === 0 ? 'bg-cine-red' : 'bg-gray-600'}" data-index="${index}"></button>
                    `).join('')}
                </div>
                ` : ''}
                ` : ''}
            </div>
        </div>
    `;

    // Carousel functionality
    if (movies && movies.length > 1) {
        let currentIndex = 0;
        const items = movies.slice(0, 10);
        
        function showSlide(index) {
            const track = document.getElementById('carousel-track');
            track.style.transform = `translateX(-${index * 100}%)`;
            
            document.querySelectorAll('.carousel-dot').forEach((dot, i) => {
                dot.classList.toggle('bg-cine-red', i === index);
                dot.classList.toggle('bg-gray-600', i !== index);
            });
        }

        document.getElementById('carousel-prev')?.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + items.length) % items.length;
            showSlide(currentIndex);
        });

        document.getElementById('carousel-next')?.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % items.length;
            showSlide(currentIndex);
        });

        document.querySelectorAll('.carousel-dot').forEach((dot, index) => {
            dot.addEventListener('click', () => {
                currentIndex = index;
                showSlide(currentIndex);
            });
        });

        // Auto-play carousel
        setInterval(() => {
            currentIndex = (currentIndex + 1) % items.length;
            showSlide(currentIndex);
        }, 5000);
    }
}

// Login View
function loginView() {
    const app = document.getElementById('app');
    auth.updateUI();

    app.innerHTML = `
        <div class="min-h-screen flex items-center justify-center bg-cine-dark py-12 px-4">
            <div class="max-w-md w-full bg-cine-gray rounded-lg shadow-xl p-8">
                <h2 class="text-3xl font-bold mb-6 text-center">Iniciar Sesión</h2>
                <form id="login-form" class="space-y-6">
                    <div>
                        <label for="username" class="block text-sm font-medium mb-2">Usuario</label>
                        <input type="text" id="username" name="username" required
                            class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-cine-red">
                    </div>
                    <div>
                        <label for="password" class="block text-sm font-medium mb-2">Contraseña</label>
                        <input type="password" id="password" name="password" required
                            class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-cine-red">
                    </div>
                    <div id="login-error" class="text-red-500 text-sm hidden"></div>
                    <button type="submit" class="w-full bg-cine-red py-2 rounded hover:bg-red-700 transition font-bold">
                        Iniciar Sesión
                    </button>
                    <p class="text-center text-sm text-gray-400">
                        ¿No tienes cuenta? <a href="#/register" class="text-cine-red hover:underline">Regístrate</a>
                    </p>
                </form>
            </div>
        </div>
    `;

    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const errorDiv = document.getElementById('login-error');
        errorDiv.classList.add('hidden');

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        // Validation
        if (!username || !password) {
            errorDiv.textContent = 'Por favor completa todos los campos';
            errorDiv.classList.remove('hidden');
            return;
        }

        try {
            const response = await api.login({ username, password });
            auth.setUser(response.user, response.token);
            showNotification('Sesión iniciada correctamente', 'success');
            router.navigate('/');
        } catch (error) {
            errorDiv.textContent = error.message;
            errorDiv.classList.remove('hidden');
        }
    });
}

// Register View
function registerView() {
    const app = document.getElementById('app');
    auth.updateUI();

    app.innerHTML = `
        <div class="min-h-screen flex items-center justify-center bg-cine-dark py-12 px-4">
            <div class="max-w-md w-full bg-cine-gray rounded-lg shadow-xl p-8">
                <h2 class="text-3xl font-bold mb-6 text-center">Registrarse</h2>
                <form id="register-form" class="space-y-4">
                    <div>
                        <label for="reg-username" class="block text-sm font-medium mb-2">Usuario</label>
                        <input type="text" id="reg-username" name="username" required
                            class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-cine-red">
                    </div>
                    <div>
                        <label for="reg-password" class="block text-sm font-medium mb-2">Contraseña</label>
                        <input type="password" id="reg-password" name="password" required
                            class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-cine-red">
                    </div>
                    <div>
                        <label for="reg-nombre" class="block text-sm font-medium mb-2">Nombre</label>
                        <input type="text" id="reg-nombre" name="nombre" required
                            class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-cine-red">
                    </div>
                    <div>
                        <label for="reg-apellido" class="block text-sm font-medium mb-2">Apellido</label>
                        <input type="text" id="reg-apellido" name="apellido" required
                            class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-cine-red">
                    </div>
                    <div>
                        <label for="reg-email" class="block text-sm font-medium mb-2">Email</label>
                        <input type="email" id="reg-email" name="email" required
                            class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-cine-red">
                    </div>
                    <div id="register-error" class="text-red-500 text-sm hidden"></div>
                    <button type="submit" class="w-full bg-cine-red py-2 rounded hover:bg-red-700 transition font-bold">
                        Registrarse
                    </button>
                    <p class="text-center text-sm text-gray-400">
                        ¿Ya tienes cuenta? <a href="#/login" class="text-cine-red hover:underline">Inicia sesión</a>
                    </p>
                </form>
            </div>
        </div>
    `;

    document.getElementById('register-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const errorDiv = document.getElementById('register-error');
        errorDiv.classList.add('hidden');

        const formData = {
            username: document.getElementById('reg-username').value.trim(),
            password: document.getElementById('reg-password').value,
            nombre: document.getElementById('reg-nombre').value.trim(),
            apellido: document.getElementById('reg-apellido').value.trim(),
            email: document.getElementById('reg-email').value.trim(),
            idTipoUsuario: 2 // Default to regular user
        };

        // Validation
        const validation = validateForm(formData, {
            username: { required: true, minLength: 3, label: 'Usuario' },
            password: { required: true, minLength: 6, label: 'Contraseña' },
            nombre: { required: true, label: 'Nombre' },
            apellido: { required: true, label: 'Apellido' },
            email: { required: true, email: true, label: 'Email' }
        });

        if (!validation.isValid) {
            errorDiv.textContent = Object.values(validation.errors)[0];
            errorDiv.classList.remove('hidden');
            return;
        }

        try {
            await api.register(formData);
            showNotification('Registro exitoso. Por favor inicia sesión', 'success');
            router.navigate('/login');
        } catch (error) {
            errorDiv.textContent = error.message;
            errorDiv.classList.remove('hidden');
        }
    });
}

// Movies View
async function moviesView() {
    const app = document.getElementById('app');
    auth.updateUI();

    let movies = [];
    let genres = [];
    let languages = [];
    let classifications = [];
    let audienceTypes = [];

    try {
        [movies, genres, languages, classifications, audienceTypes] = await Promise.all([
            api.getMovies(),
            api.getGenres(),
            api.getLanguages(),
            api.getClassifications(),
            api.getAudienceTypes()
        ]);
    } catch (error) {
        console.error('Error loading data:', error);
    }

    let filteredMovies = [...movies];
    let hasError = movies.length === 0 && genres.length === 0;

    app.innerHTML = `
        <div class="container mx-auto px-4 py-8">
            <h1 class="text-4xl font-bold mb-8">Películas en Cartelera</h1>
            
            ${hasError ? `
                <div class="bg-yellow-900 bg-opacity-50 border border-yellow-500 rounded-lg p-6 mb-6">
                    <p class="text-yellow-200">
                        ⚠️ No se pudo conectar con la API. Asegúrate de que el backend esté corriendo en el puerto correcto y que CORS esté configurado.
                    </p>
                    <p class="text-yellow-300 text-sm mt-2">
                        Revisa la consola del navegador (F12) para más detalles. La URL de la API está configurada en: <code class="bg-gray-800 px-2 py-1 rounded">https://localhost:7285/api</code>
                    </p>
                </div>
            ` : ''}
            
            <!-- Search and Filters -->
            <div class="bg-cine-gray rounded-lg p-6 mb-8">
                <div class="mb-4">
                    <input type="text" id="search-input" placeholder="Buscar por nombre de película, actor o director..."
                        class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-cine-red">
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <select id="genre-filter" class="px-4 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-cine-red">
                        <option value="">Todos los géneros</option>
                        ${genres.map(g => `<option value="${g.idGenero}">${sanitizeInput(g.nombre)}</option>`).join('')}
                    </select>
                    <select id="language-filter" class="px-4 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-cine-red">
                        <option value="">Todos los idiomas</option>
                        ${languages.map(l => `<option value="${l.idIdioma}">${sanitizeInput(l.nombre)}</option>`).join('')}
                    </select>
                    <select id="classification-filter" class="px-4 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-cine-red">
                        <option value="">Todas las clasificaciones</option>
                        ${classifications.map(c => `<option value="${c.idClasificacion}">${sanitizeInput(c.nombre)}</option>`).join('')}
                    </select>
                    <select id="audience-filter" class="px-4 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-cine-red">
                        <option value="">Todos los públicos</option>
                        ${audienceTypes.map(a => `<option value="${a.idTipoPublico}">${sanitizeInput(a.nombre)}</option>`).join('')}
                    </select>
                    <input type="number" id="duration-filter" placeholder="Duración mínima (min)"
                        class="px-4 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-cine-red">
                </div>
            </div>

            <!-- Movies Grid -->
            <div id="movies-grid" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                ${renderMoviesGrid(filteredMovies)}
            </div>
        </div>
    `;

    // Search functionality
    const searchInput = document.getElementById('search-input');
    const searchDebounced = debounce(async (query) => {
        if (query.length >= 2) {
            try {
                filteredMovies = await api.searchMovies(query);
                document.getElementById('movies-grid').innerHTML = renderMoviesGrid(filteredMovies);
            } catch (error) {
                console.error('Search error:', error);
            }
        } else {
            filteredMovies = movies;
            document.getElementById('movies-grid').innerHTML = renderMoviesGrid(filteredMovies);
        }
    }, 300);

    searchInput.addEventListener('input', (e) => {
        searchDebounced(e.target.value);
    });

    // Filter functionality
    function applyFilters() {
        const genreFilter = document.getElementById('genre-filter').value;
        const languageFilter = document.getElementById('language-filter').value;
        const classificationFilter = document.getElementById('classification-filter').value;
        const audienceFilter = document.getElementById('audience-filter').value;
        const durationFilter = document.getElementById('duration-filter').value;

        filteredMovies = movies.filter(movie => {
            if (genreFilter && !movie.peliculasGeneros?.some(pg => pg.idGenero == genreFilter)) return false;
            if (languageFilter && !movie.peliculasIdiomas?.some(pi => pi.idIdioma == languageFilter)) return false;
            if (classificationFilter && movie.idClasificacion != classificationFilter) return false;
            if (audienceFilter && movie.idTipoPublico != audienceFilter) return false;
            if (durationFilter && movie.duracion < parseInt(durationFilter)) return false;
            return true;
        });

        document.getElementById('movies-grid').innerHTML = renderMoviesGrid(filteredMovies);
    }

    document.getElementById('genre-filter').addEventListener('change', applyFilters);
    document.getElementById('language-filter').addEventListener('change', applyFilters);
    document.getElementById('classification-filter').addEventListener('change', applyFilters);
    document.getElementById('audience-filter').addEventListener('change', applyFilters);
    document.getElementById('duration-filter').addEventListener('input', applyFilters);
}

function renderMoviesGrid(movies) {
    if (movies.length === 0) {
        return '<div class="col-span-full text-center py-12 text-gray-400">No se encontraron películas</div>';
    }
    return movies.map(movie => `
        <div class="bg-cine-gray rounded-lg overflow-hidden hover:transform hover:scale-105 transition cursor-pointer"
             onclick="router.navigate('/peliculas/${movie.idPelicula}')">
            <div class="w-full h-64 bg-gray-700 flex items-center justify-center">
                <span class="text-gray-400">Imagen</span>
            </div>
            <div class="p-4">
                <h3 class="text-lg font-bold mb-2">${sanitizeInput(movie.nombre || 'Sin título')}</h3>
                <p class="text-sm text-gray-400 mb-2 line-clamp-2">${sanitizeInput(movie.descripcion || '')}</p>
                <div class="flex items-center justify-between text-sm text-gray-400">
                    <span>${formatDuration(movie.duracion || 0)}</span>
                    <span>${formatDate(movie.fechaEstreno)}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Movie Detail View
async function movieDetailView(params) {
    const app = document.getElementById('app');
    auth.updateUI();

    const movieId = params.id;
    let movie = null;

    try {
        movie = await api.getMovie(movieId);
    } catch (error) {
        app.innerHTML = `
            <div class="container mx-auto px-4 py-8">
                <div class="bg-red-900 bg-opacity-50 border border-red-500 rounded p-4">
                    <p>Error al cargar la película: ${error.message}</p>
                </div>
            </div>
        `;
        return;
    }

    app.innerHTML = `
        <div class="container mx-auto px-4 py-8">
            <a href="#/peliculas" class="text-cine-red hover:underline mb-4 inline-block">← Volver a Películas</a>
            <div class="bg-cine-gray rounded-lg p-8">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div class="w-full h-96 bg-gray-700 rounded flex items-center justify-center">
                        <span class="text-gray-400">Imagen de la Película</span>
                    </div>
                    <div>
                        <h1 class="text-4xl font-bold mb-4">${sanitizeInput(movie.nombre || 'Sin título')}</h1>
                        <p class="text-gray-300 mb-6">${sanitizeInput(movie.descripcion || 'Sin descripción')}</p>
                        <div class="space-y-2 mb-6">
                            <div><span class="font-semibold">Duración:</span> ${formatDuration(movie.duracion || 0)}</div>
                            <div><span class="font-semibold">Fecha de Estreno:</span> ${formatDate(movie.fechaEstreno)}</div>
                            <div><span class="font-semibold">Clasificación:</span> ${movie.idClasificacionNavigation?.nombre || 'N/A'}</div>
                            <div><span class="font-semibold">Tipo de Público:</span> ${movie.idTipoPublicoNavigation?.nombre || 'N/A'}</div>
                            <div><span class="font-semibold">País:</span> ${movie.idPaisNavigation?.nombre || 'N/A'}</div>
                            <div><span class="font-semibold">Distribuidora:</span> ${movie.idDistribuidoraNavigation?.nombre || 'N/A'}</div>
                        </div>
                        ${movie.peliculasGeneros?.length > 0 ? `
                            <div class="mb-4">
                                <span class="font-semibold">Géneros:</span>
                                <div class="flex flex-wrap gap-2 mt-2">
                                    ${movie.peliculasGeneros.map(pg => `
                                        <span class="bg-cine-red px-3 py-1 rounded text-sm">${pg.idGeneroNavigation?.nombre || ''}</span>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                        ${movie.peliculasIdiomas?.length > 0 ? `
                            <div class="mb-4">
                                <span class="font-semibold">Idiomas:</span>
                                <div class="flex flex-wrap gap-2 mt-2">
                                    ${movie.peliculasIdiomas.map(pi => `
                                        <span class="bg-blue-600 px-3 py-1 rounded text-sm">${pi.idIdiomaNavigation?.nombre || ''}</span>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                        ${movie.peliculasActores?.length > 0 ? `
                            <div class="mb-4">
                                <span class="font-semibold">Actores:</span>
                                <div class="flex flex-wrap gap-2 mt-2">
                                    ${movie.peliculasActores.map(pa => `
                                        <span class="bg-gray-700 px-3 py-1 rounded text-sm">${pa.idActorNavigation?.nombre || ''} ${pa.idActorNavigation?.apellido || ''}</span>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                        ${movie.peliculasDirectores?.length > 0 ? `
                            <div class="mb-4">
                                <span class="font-semibold">Directores:</span>
                                <div class="flex flex-wrap gap-2 mt-2">
                                    ${movie.peliculasDirectores.map(pd => `
                                        <span class="bg-gray-700 px-3 py-1 rounded text-sm">${pd.idDirectorNavigation?.nombre || ''} ${pd.idDirectorNavigation?.apellido || ''}</span>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                        <a href="#/comprar?pelicula=${movie.idPelicula}" class="inline-block bg-cine-red px-6 py-3 rounded hover:bg-red-700 transition font-bold">
                            Comprar Entradas
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Candy View
async function candyView() {
    const app = document.getElementById('app');
    auth.updateUI();

    let products = [];
    try {
        products = await api.getProducts();
    } catch (error) {
        console.error('Error loading products:', error);
    }

    app.innerHTML = `
        <div class="container mx-auto px-4 py-8">
            <h1 class="text-4xl font-bold mb-8">Candy Shop</h1>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                ${products.map(product => `
                    <div class="bg-cine-gray rounded-lg overflow-hidden hover:transform hover:scale-105 transition">
                        <div class="w-full h-48 bg-gray-700 flex items-center justify-center cursor-pointer"
                             onclick="router.navigate('/candy/${product.idProducto}')">
                            <span class="text-gray-400">Imagen</span>
                        </div>
                        <div class="p-4">
                            <h3 class="text-lg font-bold mb-2 cursor-pointer"
                                onclick="router.navigate('/candy/${product.idProducto}')">
                                ${sanitizeInput(product.nombre || 'Sin nombre')}
                            </h3>
                            <div class="flex items-center justify-between">
                                <span class="text-xl font-bold text-cine-red">${formatCurrency(product.precio || 0)}</span>
                                <button onclick="addToCart(${product.idProducto})" 
                                        class="bg-cine-red w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-700 transition">
                                    <span class="text-white font-bold">+</span>
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Add to cart function (global for onclick)
window.addToCart = function(productId) {
    cart.addProduct(productId, 1);
    showNotification('Producto agregado al carrito', 'success');
};

// Candy Detail View
async function candyDetailView(params) {
    const app = document.getElementById('app');
    auth.updateUI();

    const productId = params.id;
    let product = null;

    try {
        product = await api.getProduct(productId);
    } catch (error) {
        app.innerHTML = `
            <div class="container mx-auto px-4 py-8">
                <div class="bg-red-900 bg-opacity-50 border border-red-500 rounded p-4">
                    <p>Error al cargar el producto: ${error.message}</p>
                </div>
            </div>
        `;
        return;
    }

    app.innerHTML = `
        <div class="container mx-auto px-4 py-8">
            <a href="#/candy" class="text-cine-red hover:underline mb-4 inline-block">← Volver a Candy Shop</a>
            <div class="bg-cine-gray rounded-lg p-8">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div class="w-full h-96 bg-gray-700 rounded flex items-center justify-center">
                        <span class="text-gray-400">Imagen del Producto</span>
                    </div>
                    <div>
                        <h1 class="text-4xl font-bold mb-4">${sanitizeInput(product.nombre || 'Sin nombre')}</h1>
                        <p class="text-gray-300 mb-6 text-xl">${formatCurrency(product.precio || 0)}</p>
                        <p class="text-gray-300 mb-6">${sanitizeInput(product.descripcion || 'Sin descripción')}</p>
                        <div class="mb-4">
                            <span class="font-semibold">Tipo de Producto:</span> ${product.idTipoProductoNavigation?.nombre || 'N/A'}
                        </div>
                        <button onclick="addToCart(${product.idProducto})" 
                                class="bg-cine-red px-6 py-3 rounded hover:bg-red-700 transition font-bold">
                            Agregar al Carrito
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Purchase View (Multi-step process)
let purchaseState = {
    step: 1,
    selectedMovie: null,
    selectedFunction: null,
    selectedSeats: [],
    selectedProducts: []
};

async function purchaseView() {
    const app = document.getElementById('app');
    auth.updateUI();

    // Check if user is authenticated
    if (!auth.isAuthenticated()) {
        showNotification('Debes iniciar sesión para comprar entradas', 'error');
        router.navigate('/login');
        return;
    }

    // Get movie from query params if present
    const hash = window.location.hash;
    const movieId = hash.includes('pelicula=') ? hash.split('pelicula=')[1].split('&')[0] : null;

    if (movieId && purchaseState.step === 1) {
        try {
            purchaseState.selectedMovie = await api.getMovie(movieId);
        } catch (error) {
            console.error('Error loading movie:', error);
        }
    }

    renderPurchaseStep();
}

function renderPurchaseStep() {
    const app = document.getElementById('app');
    
    switch (purchaseState.step) {
        case 1:
            renderStep1SelectMovie();
            break;
        case 2:
            renderStep2SelectDateTime();
            break;
        case 3:
            renderStep3SelectSeats();
            break;
        case 4:
            renderStep4AddProducts();
            break;
        case 5:
            renderStep5ReviewCart();
            break;
        case 6:
            renderStep6Payment();
            break;
    }
}

async function renderStep1SelectMovie() {
    const app = document.getElementById('app');
    let movies = [];
    try {
        movies = await api.getMovies();
    } catch (error) {
        console.error('Error loading movies:', error);
    }

    app.innerHTML = `
        <div class="container mx-auto px-4 py-8">
            <h1 class="text-4xl font-bold mb-8">Comprar Entradas</h1>
            <div class="mb-4">
                <div class="flex items-center space-x-2 mb-2">
                    <div class="w-8 h-8 rounded-full bg-cine-red flex items-center justify-center font-bold">1</div>
                    <span class="font-semibold">Seleccionar Película</span>
                </div>
                <div class="ml-4 border-l-2 border-gray-700 pl-4">
                    <div class="flex items-center space-x-2 text-gray-500">
                        <div class="w-8 h-8 rounded-full border-2 border-gray-700 flex items-center justify-center">2</div>
                        <span>Fecha y Hora</span>
                    </div>
                </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                ${movies.map(movie => `
                    <div class="bg-cine-gray rounded-lg overflow-hidden hover:transform hover:scale-105 transition cursor-pointer ${purchaseState.selectedMovie?.idPelicula === movie.idPelicula ? 'ring-2 ring-cine-red' : ''}"
                         onclick="selectMovie(${movie.idPelicula})">
                        <div class="w-full h-48 bg-gray-700 flex items-center justify-center">
                            <span class="text-gray-400">Imagen</span>
                        </div>
                        <div class="p-4">
                            <h3 class="font-bold">${sanitizeInput(movie.nombre || 'Sin título')}</h3>
                            <p class="text-sm text-gray-400 mt-2">${formatDuration(movie.duracion || 0)}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
            ${purchaseState.selectedMovie ? `
                <div class="mt-8 flex justify-end">
                    <button onclick="nextStep()" class="bg-cine-red px-6 py-3 rounded hover:bg-red-700 transition font-bold">
                        Continuar
                    </button>
                </div>
            ` : ''}
        </div>
    `;
}

window.selectMovie = async function(movieId) {
    try {
        purchaseState.selectedMovie = await api.getMovie(movieId);
        renderPurchaseStep();
    } catch (error) {
        showNotification('Error al cargar la película', 'error');
    }
};

async function renderStep2SelectDateTime() {
    const app = document.getElementById('app');
    let functions = [];
    try {
        functions = await api.getFunctions(purchaseState.selectedMovie.idPelicula);
    } catch (error) {
        console.error('Error loading functions:', error);
    }

    // Group functions by date
    const functionsByDate = {};
    functions.forEach(func => {
        const date = new Date(func.fechaHoraInicio).toLocaleDateString('es-AR');
        if (!functionsByDate[date]) {
            functionsByDate[date] = [];
        }
        functionsByDate[date].push(func);
    });

    app.innerHTML = `
        <div class="container mx-auto px-4 py-8">
            <h1 class="text-4xl font-bold mb-8">Comprar Entradas</h1>
            <div class="mb-4">
                <div class="flex items-center space-x-2 mb-2">
                    <div class="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center font-bold">✓</div>
                    <span class="font-semibold text-gray-400">Película: ${sanitizeInput(purchaseState.selectedMovie.nombre)}</span>
                </div>
                <div class="flex items-center space-x-2 mb-2">
                    <div class="w-8 h-8 rounded-full bg-cine-red flex items-center justify-center font-bold">2</div>
                    <span class="font-semibold">Seleccionar Fecha y Hora</span>
                </div>
            </div>
            <div class="space-y-6">
                ${Object.keys(functionsByDate).map(date => `
                    <div>
                        <h3 class="text-xl font-bold mb-4">${date}</h3>
                        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            ${functionsByDate[date].map(func => {
                                const time = new Date(func.fechaHoraInicio).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
                                const isSelected = purchaseState.selectedFunction?.idFuncion === func.idFuncion;
                                return `
                                    <button onclick="selectFunction(${func.idFuncion})"
                                            class="bg-cine-gray p-4 rounded hover:bg-gray-700 transition ${isSelected ? 'ring-2 ring-cine-red' : ''}">
                                        <div class="font-bold">${time}</div>
                                        <div class="text-sm text-gray-400">${formatCurrency(func.precioBase)}</div>
                                    </button>
                                `;
                            }).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="mt-8 flex justify-between">
                <button onclick="previousStep()" class="bg-gray-700 px-6 py-3 rounded hover:bg-gray-600 transition">
                    Atrás
                </button>
                ${purchaseState.selectedFunction ? `
                    <button onclick="nextStep()" class="bg-cine-red px-6 py-3 rounded hover:bg-red-700 transition font-bold">
                        Continuar
                    </button>
                ` : ''}
            </div>
        </div>
    `;
}

window.selectFunction = async function(functionId) {
    try {
        purchaseState.selectedFunction = await api.getFunction(functionId);
        renderPurchaseStep();
    } catch (error) {
        showNotification('Error al cargar la función', 'error');
    }
};

async function renderStep3SelectSeats() {
    const app = document.getElementById('app');
    let seats = [];
    try {
        seats = await api.getSeats(purchaseState.selectedFunction.idFuncion);
    } catch (error) {
        console.error('Error loading seats:', error);
    }

    // Group seats by row (assuming seats have row/column info)
    // This is a simplified version - adjust based on your seat data structure
    app.innerHTML = `
        <div class="container mx-auto px-4 py-8">
            <h1 class="text-4xl font-bold mb-8">Comprar Entradas</h1>
            <div class="mb-4">
                <div class="flex items-center space-x-2 mb-2">
                    <div class="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center font-bold">✓</div>
                    <span class="font-semibold text-gray-400">Película y Función seleccionadas</span>
                </div>
                <div class="flex items-center space-x-2 mb-2">
                    <div class="w-8 h-8 rounded-full bg-cine-red flex items-center justify-center font-bold">3</div>
                    <span class="font-semibold">Seleccionar Butacas</span>
                </div>
            </div>
            <div class="bg-cine-gray rounded-lg p-8 mb-6">
                <div class="text-center mb-8">
                    <div class="inline-block bg-gray-700 w-12 h-12 rounded mb-2"></div>
                    <span class="block text-sm">Pantalla</span>
                </div>
                <div id="seats-container" class="grid grid-cols-10 gap-2 justify-center">
                    ${seats.map(seat => {
                        const isSelected = purchaseState.selectedSeats.includes(seat.idButaca);
                        const isOccupied = seat.estado === 'Ocupada' || seat.estado === 'Reservada';
                        return `
                            <button onclick="toggleSeat(${seat.idButaca})"
                                    class="w-10 h-10 rounded ${isSelected ? 'bg-cine-red' : isOccupied ? 'bg-gray-800 cursor-not-allowed' : 'bg-gray-700 hover:bg-gray-600'} transition"
                                    ${isOccupied ? 'disabled' : ''}>
                                ${seat.fila}${seat.columna}
                            </button>
                        `;
                    }).join('')}
                </div>
                <div class="mt-6 flex justify-center space-x-6">
                    <div class="flex items-center space-x-2">
                        <div class="w-6 h-6 bg-gray-700 rounded"></div>
                        <span>Disponible</span>
                    </div>
                    <div class="flex items-center space-x-2">
                        <div class="w-6 h-6 bg-cine-red rounded"></div>
                        <span>Seleccionada</span>
                    </div>
                    <div class="flex items-center space-x-2">
                        <div class="w-6 h-6 bg-gray-800 rounded"></div>
                        <span>Ocupada</span>
                    </div>
                </div>
            </div>
            <div class="mt-8 flex justify-between">
                <button onclick="previousStep()" class="bg-gray-700 px-6 py-3 rounded hover:bg-gray-600 transition">
                    Atrás
                </button>
                ${purchaseState.selectedSeats.length > 0 ? `
                    <button onclick="nextStep()" class="bg-cine-red px-6 py-3 rounded hover:bg-red-700 transition font-bold">
                        Continuar (${purchaseState.selectedSeats.length} butaca${purchaseState.selectedSeats.length > 1 ? 's' : ''})
                    </button>
                ` : '<span class="text-gray-500">Selecciona al menos una butaca</span>'}
            </div>
        </div>
    `;
}

window.toggleSeat = function(seatId) {
    const index = purchaseState.selectedSeats.indexOf(seatId);
    if (index > -1) {
        purchaseState.selectedSeats.splice(index, 1);
    } else {
        purchaseState.selectedSeats.push(seatId);
    }
    renderPurchaseStep();
};

async function renderStep4AddProducts() {
    const app = document.getElementById('app');
    let products = [];
    try {
        products = await api.getProducts();
    } catch (error) {
        console.error('Error loading products:', error);
    }

    const cartData = cart.get();

    app.innerHTML = `
        <div class="container mx-auto px-4 py-8">
            <h1 class="text-4xl font-bold mb-8">Comprar Entradas</h1>
            <div class="mb-4">
                <div class="flex items-center space-x-2 mb-2">
                    <div class="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center font-bold">✓</div>
                    <span class="font-semibold text-gray-400">Butacas seleccionadas</span>
                </div>
                <div class="flex items-center space-x-2 mb-2">
                    <div class="w-8 h-8 rounded-full bg-cine-red flex items-center justify-center font-bold">4</div>
                    <span class="font-semibold">Agregar Productos (Opcional)</span>
                </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
                ${products.map(product => {
                    const cartItem = cartData.products.find(p => p.id === product.idProducto);
                    const quantity = cartItem ? cartItem.quantity : 0;
                    return `
                        <div class="bg-cine-gray rounded-lg overflow-hidden">
                            <div class="w-full h-32 bg-gray-700 flex items-center justify-center">
                                <span class="text-gray-400 text-sm">Imagen</span>
                            </div>
                            <div class="p-4">
                                <h3 class="font-bold mb-2">${sanitizeInput(product.nombre)}</h3>
                                <div class="flex items-center justify-between">
                                    <span class="text-cine-red font-bold">${formatCurrency(product.precio)}</span>
                                    <div class="flex items-center space-x-2">
                                        <button onclick="updateProductQuantity(${product.idProducto}, ${quantity - 1})"
                                                class="bg-gray-700 w-8 h-8 rounded flex items-center justify-center hover:bg-gray-600"
                                                ${quantity === 0 ? 'disabled' : ''}>-</button>
                                        <span class="w-8 text-center">${quantity}</span>
                                        <button onclick="updateProductQuantity(${product.idProducto}, ${quantity + 1})"
                                                class="bg-cine-red w-8 h-8 rounded flex items-center justify-center hover:bg-red-700">+</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
            <div class="mt-8 flex justify-between">
                <button onclick="previousStep()" class="bg-gray-700 px-6 py-3 rounded hover:bg-gray-600 transition">
                    Atrás
                </button>
                <button onclick="nextStep()" class="bg-cine-red px-6 py-3 rounded hover:bg-red-700 transition font-bold">
                    Ver Carrito
                </button>
            </div>
        </div>
    `;
}

window.updateProductQuantity = function(productId, quantity) {
    if (quantity < 0) return;
    cart.updateProductQuantity(productId, quantity);
    renderPurchaseStep();
};

async function renderStep5ReviewCart() {
    const app = document.getElementById('app');
    const cartData = cart.get();
    let products = [];
    try {
        products = await api.getProducts();
    } catch (error) {
        console.error('Error loading products:', error);
    }

    const selectedProducts = cartData.products.map(item => {
        const product = products.find(p => p.idProducto === item.id);
        return { ...item, product };
    }).filter(item => item.product);

    const seatsTotal = purchaseState.selectedSeats.length * (purchaseState.selectedFunction?.precioBase || 0);
    const productsTotal = selectedProducts.reduce((sum, item) => sum + (item.product.precio * item.quantity), 0);
    const total = seatsTotal + productsTotal;

    app.innerHTML = `
        <div class="container mx-auto px-4 py-8">
            <h1 class="text-4xl font-bold mb-8">Resumen de Compra</h1>
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div class="lg:col-span-2 space-y-6">
                    <div class="bg-cine-gray rounded-lg p-6">
                        <h2 class="text-2xl font-bold mb-4">Película</h2>
                        <p class="text-xl">${sanitizeInput(purchaseState.selectedMovie.nombre)}</p>
                        <p class="text-gray-400 mt-2">${formatDateTime(purchaseState.selectedFunction.fechaHoraInicio)}</p>
                    </div>
                    <div class="bg-cine-gray rounded-lg p-6">
                        <h2 class="text-2xl font-bold mb-4">Butacas</h2>
                        <div class="flex flex-wrap gap-2">
                            ${purchaseState.selectedSeats.map(seatId => `
                                <span class="bg-cine-red px-3 py-1 rounded">Butaca ${seatId}</span>
                            `).join('')}
                        </div>
                        <p class="mt-4 text-right">${purchaseState.selectedSeats.length} x ${formatCurrency(purchaseState.selectedFunction.precioBase)} = ${formatCurrency(seatsTotal)}</p>
                    </div>
                    ${selectedProducts.length > 0 ? `
                        <div class="bg-cine-gray rounded-lg p-6">
                            <h2 class="text-2xl font-bold mb-4">Productos</h2>
                            ${selectedProducts.map(item => `
                                <div class="flex justify-between items-center mb-2">
                                    <span>${sanitizeInput(item.product.nombre)} x ${item.quantity}</span>
                                    <span>${formatCurrency(item.product.precio * item.quantity)}</span>
                                </div>
                            `).join('')}
                            <p class="mt-4 text-right font-bold">Total productos: ${formatCurrency(productsTotal)}</p>
                        </div>
                    ` : ''}
                </div>
                <div class="lg:col-span-1">
                    <div class="bg-cine-gray rounded-lg p-6 sticky top-20">
                        <h2 class="text-2xl font-bold mb-4">Total</h2>
                        <div class="space-y-2 mb-4">
                            <div class="flex justify-between">
                                <span>Entradas:</span>
                                <span>${formatCurrency(seatsTotal)}</span>
                            </div>
                            ${selectedProducts.length > 0 ? `
                                <div class="flex justify-between">
                                    <span>Productos:</span>
                                    <span>${formatCurrency(productsTotal)}</span>
                                </div>
                            ` : ''}
                        </div>
                        <div class="border-t border-gray-700 pt-4 mb-4">
                            <div class="flex justify-between text-xl font-bold">
                                <span>Total:</span>
                                <span class="text-cine-red">${formatCurrency(total)}</span>
                            </div>
                        </div>
                        <div class="flex space-x-4">
                            <button onclick="previousStep()" class="flex-1 bg-gray-700 px-4 py-2 rounded hover:bg-gray-600 transition">
                                Atrás
                            </button>
                            <button onclick="nextStep()" class="flex-1 bg-cine-red px-4 py-2 rounded hover:bg-red-700 transition font-bold">
                                Pagar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderStep6Payment() {
    const app = document.getElementById('app');
    const user = auth.getUser();

    app.innerHTML = `
        <div class="container mx-auto px-4 py-8">
            <h1 class="text-4xl font-bold mb-8">Confirmar Pago</h1>
            <div class="max-w-2xl mx-auto bg-cine-gray rounded-lg p-8">
                <form id="payment-form" class="space-y-6">
                    <div>
                        <label class="block text-sm font-medium mb-2">Nombre Completo</label>
                        <input type="text" value="${sanitizeInput(user?.nombre || '')} ${sanitizeInput(user?.apellido || '')}" 
                               class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded" readonly>
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-2">Email</label>
                        <input type="email" value="${sanitizeInput(user?.email || '')}" 
                               class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded" readonly>
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-2">Forma de Pago</label>
                        <select id="payment-method" class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded">
                            <option value="tarjeta">Tarjeta de Crédito/Débito</option>
                            <option value="efectivo">Efectivo</option>
                        </select>
                    </div>
                    <div id="payment-error" class="text-red-500 text-sm hidden"></div>
                    <div class="flex space-x-4">
                        <button type="button" onclick="previousStep()" class="flex-1 bg-gray-700 px-4 py-2 rounded hover:bg-gray-600 transition">
                            Atrás
                        </button>
                        <button type="submit" class="flex-1 bg-cine-red px-4 py-2 rounded hover:bg-red-700 transition font-bold">
                            Confirmar Pago
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.getElementById('payment-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const errorDiv = document.getElementById('payment-error');
        errorDiv.classList.add('hidden');

        try {
            const reservationData = {
                idCliente: user.idUsuario,
                idFuncion: purchaseState.selectedFunction.idFuncion,
                butacas: purchaseState.selectedSeats
            };

            await api.createReservation(reservationData);
            showNotification('Reserva creada exitosamente', 'success');
            cart.clear();
            purchaseState = { step: 1, selectedMovie: null, selectedFunction: null, selectedSeats: [], selectedProducts: [] };
            router.navigate('/');
        } catch (error) {
            errorDiv.textContent = error.message;
            errorDiv.classList.remove('hidden');
        }
    });
}

window.nextStep = function() {
    if (purchaseState.step < 6) {
        purchaseState.step++;
        renderPurchaseStep();
    }
};

window.previousStep = function() {
    if (purchaseState.step > 1) {
        purchaseState.step--;
        renderPurchaseStep();
    }
};

// Dashboard View
async function dashboardView() {
    const app = document.getElementById('app');
    auth.updateUI();

    if (!auth.isAdmin()) {
        showNotification('Acceso denegado. Solo administradores pueden acceder al dashboard.', 'error');
        router.navigate('/');
        return;
    }

    let analytics = {};
    try {
        analytics = await api.getAnalytics();
    } catch (error) {
        console.error('Error loading analytics:', error);
    }

    app.innerHTML = `
        <div class="flex min-h-screen">
            <!-- Sidebar -->
            <aside class="w-64 bg-cine-gray border-r border-gray-800 fixed h-full">
                <div class="p-4">
                    <h2 class="text-2xl font-bold mb-6">Dashboard</h2>
                    <nav class="space-y-2">
                        <a href="#/dashboard" class="flex items-center space-x-3 p-3 rounded hover:bg-gray-800 transition ${router.currentRoute === '/dashboard' ? 'bg-gray-800' : ''}">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                            </svg>
                            <span>Inicio</span>
                        </a>
                        <a href="#/dashboard/peliculas" class="flex items-center space-x-3 p-3 rounded hover:bg-gray-800 transition">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"></path>
                            </svg>
                            <span>Películas</span>
                        </a>
                        <a href="#/dashboard/productos" class="flex items-center space-x-3 p-3 rounded hover:bg-gray-800 transition">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                            </svg>
                            <span>Productos</span>
                        </a>
                        <a href="#/dashboard/funciones" class="flex items-center space-x-3 p-3 rounded hover:bg-gray-800 transition">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <span>Funciones</span>
                        </a>
                        <a href="#/dashboard/actores" class="flex items-center space-x-3 p-3 rounded hover:bg-gray-800 transition">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                            </svg>
                            <span>Actores</span>
                        </a>
                        <a href="#/dashboard/directores" class="flex items-center space-x-3 p-3 rounded hover:bg-gray-800 transition">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                            </svg>
                            <span>Directores</span>
                        </a>
                        <a href="#/dashboard/idiomas" class="flex items-center space-x-3 p-3 rounded hover:bg-gray-800 transition">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path>
                            </svg>
                            <span>Idiomas</span>
                        </a>
                    </nav>
                </div>
            </aside>

            <!-- Main Content -->
            <main class="flex-1 ml-64 p-8">
                <h1 class="text-4xl font-bold mb-8">Analíticas</h1>
                
                <!-- Filters -->
                <div class="bg-cine-gray rounded-lg p-6 mb-8">
                    <h2 class="text-xl font-bold mb-4">Filtros</h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label class="block text-sm font-medium mb-2">Fecha Inicio</label>
                            <input type="date" id="filter-date-start" class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded">
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-2">Fecha Fin</label>
                            <input type="date" id="filter-date-end" class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded">
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-2">Monto Mínimo</label>
                            <input type="number" id="filter-amount-min" class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded">
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-2">Monto Máximo</label>
                            <input type="number" id="filter-amount-max" class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded">
                        </div>
                    </div>
                    <button onclick="applyAnalyticsFilters()" class="mt-4 bg-cine-red px-6 py-2 rounded hover:bg-red-700 transition">
                        Aplicar Filtros
                    </button>
                </div>

                <!-- Analytics Cards -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div class="bg-cine-gray rounded-lg p-6">
                        <h3 class="text-gray-400 mb-2">Total Vendido</h3>
                        <p class="text-3xl font-bold">${formatCurrency(analytics.totalVendido || 0)}</p>
                    </div>
                    <div class="bg-cine-gray rounded-lg p-6">
                        <h3 class="text-gray-400 mb-2">Funciones Vendidas</h3>
                        <p class="text-3xl font-bold">${analytics.funcionesVendidas || 0}</p>
                    </div>
                    <div class="bg-cine-gray rounded-lg p-6">
                        <h3 class="text-gray-400 mb-2">Entradas Vendidas</h3>
                        <p class="text-3xl font-bold">${analytics.entradasVendidas || 0}</p>
                    </div>
                    <div class="bg-cine-gray rounded-lg p-6">
                        <h3 class="text-gray-400 mb-2">Promedio por Función</h3>
                        <p class="text-3xl font-bold">${formatCurrency(analytics.promedioPorFuncion || 0)}</p>
                    </div>
                </div>

                <!-- Charts/Graphs would go here -->
                <div class="bg-cine-gray rounded-lg p-6">
                    <h2 class="text-xl font-bold mb-4">Ventas por Día</h2>
                    <div class="h-64 flex items-center justify-center text-gray-400">
                        Gráfico de ventas (implementar con librería de gráficos si es necesario)
                    </div>
                </div>
            </main>
        </div>
    `;
}

window.applyAnalyticsFilters = async function() {
    const filters = {
        fechaInicio: document.getElementById('filter-date-start').value,
        fechaFin: document.getElementById('filter-date-end').value,
        montoMinimo: document.getElementById('filter-amount-min').value,
        montoMaximo: document.getElementById('filter-amount-max').value
    };

    try {
        const analytics = await api.getAnalytics(filters);
        // Update analytics display
        showNotification('Filtros aplicados', 'success');
        // Reload dashboard
        dashboardView();
    } catch (error) {
        showNotification('Error al aplicar filtros', 'error');
    }
};

// Dashboard Section View (CRUD forms)
async function dashboardSectionView(params) {
    const app = document.getElementById('app');
    auth.updateUI();

    if (!auth.isAdmin()) {
        showNotification('Acceso denegado', 'error');
        router.navigate('/');
        return;
    }

    const section = params.section;
    
    switch (section) {
        case 'peliculas':
            await renderMoviesCRUD();
            break;
        case 'productos':
            await renderProductsCRUD();
            break;
        case 'funciones':
            await renderFunctionsCRUD();
            break;
        case 'actores':
            await renderActorsCRUD();
            break;
        case 'directores':
            await renderDirectorsCRUD();
            break;
        case 'idiomas':
            await renderLanguagesCRUD();
            break;
        default:
            router.navigate('/dashboard');
    }
}

// CRUD Views - These would be very long, so I'll create simplified versions
// In a real implementation, these would be more complete

async function renderMoviesCRUD() {
    const app = document.getElementById('app');
    let movies = [];
    try {
        movies = await api.getMovies();
    } catch (error) {
        console.error('Error loading movies:', error);
    }

    app.innerHTML = `
        <div class="flex min-h-screen">
            <aside class="w-64 bg-cine-gray border-r border-gray-800 fixed h-full">
                <div class="p-4">
                    <h2 class="text-2xl font-bold mb-6">Dashboard</h2>
                    <nav class="space-y-2">
                        <a href="#/dashboard" class="flex items-center space-x-3 p-3 rounded hover:bg-gray-800 transition">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                            <span>Inicio</span>
                        </a>
                        <a href="#/dashboard/peliculas" class="flex items-center space-x-3 p-3 rounded hover:bg-gray-800 transition bg-gray-800">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"></path></svg>
                            <span>Películas</span>
                        </a>
                        <a href="#/dashboard/productos" class="flex items-center space-x-3 p-3 rounded hover:bg-gray-800 transition">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                            <span>Productos</span>
                        </a>
                        <a href="#/dashboard/funciones" class="flex items-center space-x-3 p-3 rounded hover:bg-gray-800 transition">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            <span>Funciones</span>
                        </a>
                        <a href="#/dashboard/actores" class="flex items-center space-x-3 p-3 rounded hover:bg-gray-800 transition">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                            <span>Actores</span>
                        </a>
                        <a href="#/dashboard/directores" class="flex items-center space-x-3 p-3 rounded hover:bg-gray-800 transition">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                            <span>Directores</span>
                        </a>
                        <a href="#/dashboard/idiomas" class="flex items-center space-x-3 p-3 rounded hover:bg-gray-800 transition">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path></svg>
                            <span>Idiomas</span>
                        </a>
                    </nav>
                </div>
            </aside>
            <main class="flex-1 ml-64 p-8">
                <div class="flex justify-between items-center mb-6">
                    <h1 class="text-4xl font-bold">Gestión de Películas</h1>
                    <button onclick="showMovieForm()" class="bg-cine-red px-6 py-2 rounded hover:bg-red-700 transition">
                        + Agregar Película
                    </button>
                </div>
                <div class="bg-cine-gray rounded-lg overflow-hidden">
                    <table class="w-full">
                        <thead class="bg-gray-800">
                            <tr>
                                <th class="px-6 py-3 text-left">ID</th>
                                <th class="px-6 py-3 text-left">Nombre</th>
                                <th class="px-6 py-3 text-left">Duración</th>
                                <th class="px-6 py-3 text-left">Fecha Estreno</th>
                                <th class="px-6 py-3 text-left">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${movies.map(movie => `
                                <tr class="border-t border-gray-700 hover:bg-gray-800">
                                    <td class="px-6 py-4">${movie.idPelicula}</td>
                                    <td class="px-6 py-4">${sanitizeInput(movie.nombre)}</td>
                                    <td class="px-6 py-4">${formatDuration(movie.duracion)}</td>
                                    <td class="px-6 py-4">${formatDate(movie.fechaEstreno)}</td>
                                    <td class="px-6 py-4">
                                        <button onclick="editMovie(${movie.idPelicula})" class="text-blue-400 hover:text-blue-300 mr-4">Editar</button>
                                        <button onclick="deleteMovie(${movie.idPelicula})" class="text-red-400 hover:text-red-300">Eliminar</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    `;
}

// Similar CRUD functions for other entities would follow...
// For brevity, I'll create simplified versions that follow the same pattern

async function renderProductsCRUD() {
    // Similar structure to renderMoviesCRUD but for products
    const app = document.getElementById('app');
    let products = [];
    try {
        products = await api.getProducts();
    } catch (error) {
        console.error('Error loading products:', error);
    }

    app.innerHTML = `
        <div class="flex min-h-screen">
            <aside class="w-64 bg-cine-gray border-r border-gray-800 fixed h-full">
                <div class="p-4">
                    <h2 class="text-2xl font-bold mb-6">Dashboard</h2>
                    <nav class="space-y-2">
                        <a href="#/dashboard" class="flex items-center space-x-3 p-3 rounded hover:bg-gray-800 transition">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                            <span>Inicio</span>
                        </a>
                        <a href="#/dashboard/productos" class="flex items-center space-x-3 p-3 rounded hover:bg-gray-800 transition bg-gray-800">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                            <span>Productos</span>
                        </a>
                    </nav>
                </div>
            </aside>
            <main class="flex-1 ml-64 p-8">
                <div class="flex justify-between items-center mb-6">
                    <h1 class="text-4xl font-bold">Gestión de Productos</h1>
                    <button onclick="showProductForm()" class="bg-cine-red px-6 py-2 rounded hover:bg-red-700 transition">
                        + Agregar Producto
                    </button>
                </div>
                <div class="bg-cine-gray rounded-lg overflow-hidden">
                    <table class="w-full">
                        <thead class="bg-gray-800">
                            <tr>
                                <th class="px-6 py-3 text-left">ID</th>
                                <th class="px-6 py-3 text-left">Nombre</th>
                                <th class="px-6 py-3 text-left">Precio</th>
                                <th class="px-6 py-3 text-left">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${products.map(product => `
                                <tr class="border-t border-gray-700 hover:bg-gray-800">
                                    <td class="px-6 py-4">${product.idProducto}</td>
                                    <td class="px-6 py-4">${sanitizeInput(product.nombre)}</td>
                                    <td class="px-6 py-4">${formatCurrency(product.precio)}</td>
                                    <td class="px-6 py-4">
                                        <button onclick="editProduct(${product.idProducto})" class="text-blue-400 hover:text-blue-300 mr-4">Editar</button>
                                        <button onclick="deleteProduct(${product.idProducto})" class="text-red-400 hover:text-red-300">Eliminar</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    `;
}

// Placeholder functions for CRUD operations
window.showMovieForm = function(movieId = null) {
    // Show modal/form for creating/editing movie
    showNotification('Formulario de película (implementar modal)', 'info');
};

window.editMovie = function(movieId) {
    showMovieForm(movieId);
};

window.deleteMovie = async function(movieId) {
    if (confirm('¿Estás seguro de eliminar esta película?')) {
        try {
            await api.deleteMovie(movieId);
            showNotification('Película eliminada', 'success');
            renderMoviesCRUD();
        } catch (error) {
            showNotification('Error al eliminar película', 'error');
        }
    }
};

window.showProductForm = function(productId = null) {
    showNotification('Formulario de producto (implementar modal)', 'info');
};

window.editProduct = function(productId) {
    showProductForm(productId);
};

window.deleteProduct = async function(productId) {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
        try {
            await api.deleteProduct(productId);
            showNotification('Producto eliminado', 'success');
            renderProductsCRUD();
        } catch (error) {
            showNotification('Error al eliminar producto', 'error');
        }
    }
};

// Simplified CRUD for other entities
async function renderFunctionsCRUD() {
    // Similar to movies/products CRUD
    const app = document.getElementById('app');
    app.innerHTML = `<div class="container mx-auto px-4 py-8"><h1 class="text-4xl font-bold">Gestión de Funciones</h1><p>Implementar similar a películas/productos</p></div>`;
}

async function renderActorsCRUD() {
    const app = document.getElementById('app');
    let actors = [];
    try {
        actors = await api.getActors();
    } catch (error) {
        console.error('Error loading actors:', error);
    }

    app.innerHTML = `
        <div class="flex min-h-screen">
            <aside class="w-64 bg-cine-gray border-r border-gray-800 fixed h-full">
                <div class="p-4">
                    <h2 class="text-2xl font-bold mb-6">Dashboard</h2>
                    <nav class="space-y-2">
                        <a href="#/dashboard/actores" class="flex items-center space-x-3 p-3 rounded hover:bg-gray-800 transition bg-gray-800">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                            <span>Actores</span>
                        </a>
                    </nav>
                </div>
            </aside>
            <main class="flex-1 ml-64 p-8">
                <div class="flex justify-between items-center mb-6">
                    <h1 class="text-4xl font-bold">Gestión de Actores</h1>
                    <button onclick="showActorForm()" class="bg-cine-red px-6 py-2 rounded hover:bg-red-700 transition">
                        + Agregar Actor
                    </button>
                </div>
                <div class="bg-cine-gray rounded-lg overflow-hidden">
                    <table class="w-full">
                        <thead class="bg-gray-800">
                            <tr>
                                <th class="px-6 py-3 text-left">ID</th>
                                <th class="px-6 py-3 text-left">Nombre</th>
                                <th class="px-6 py-3 text-left">Apellido</th>
                                <th class="px-6 py-3 text-left">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${actors.map(actor => `
                                <tr class="border-t border-gray-700 hover:bg-gray-800">
                                    <td class="px-6 py-4">${actor.idActor}</td>
                                    <td class="px-6 py-4">${sanitizeInput(actor.nombre)}</td>
                                    <td class="px-6 py-4">${sanitizeInput(actor.apellido)}</td>
                                    <td class="px-6 py-4">
                                        <button onclick="editActor(${actor.idActor})" class="text-blue-400 hover:text-blue-300 mr-4">Editar</button>
                                        <button onclick="deleteActor(${actor.idActor})" class="text-red-400 hover:text-red-300">Eliminar</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    `;
}

async function renderDirectorsCRUD() {
    // Similar to actors
    const app = document.getElementById('app');
    app.innerHTML = `<div class="container mx-auto px-4 py-8"><h1 class="text-4xl font-bold">Gestión de Directores</h1><p>Implementar similar a actores</p></div>`;
}

async function renderLanguagesCRUD() {
    // Similar to actors
    const app = document.getElementById('app');
    app.innerHTML = `<div class="container mx-auto px-4 py-8"><h1 class="text-4xl font-bold">Gestión de Idiomas</h1><p>Implementar similar a actores</p></div>`;
}
