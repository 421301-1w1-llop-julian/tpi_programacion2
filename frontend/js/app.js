// Main Application
document.addEventListener('DOMContentLoaded', () => {
    // Register all routes with HTML views
    router.register('/', 'home.html', homeViewHandler);
    router.register('/login', 'login.html', loginViewHandler);
    router.register('/register', 'register.html', registerViewHandler);
    router.register('/peliculas', 'movies.html', moviesViewHandler);
    router.register('/peliculas/:id', 'movie-detail.html', movieDetailViewHandler);
    router.register('/candy', 'candy.html', candyViewHandler);
    router.register('/candy/:id', 'candy-detail.html', candyDetailViewHandler);
    router.register('/comprar', 'purchase.html', purchaseViewHandler);
    router.register('/dashboard', 'dashboard.html', dashboardViewHandler);
    router.register('/dashboard/peliculas', 'dashboard-peliculas.html', () => dashboardSectionViewHandler({ section: 'peliculas' }));
    router.register('/dashboard/productos', 'dashboard-productos.html', () => dashboardSectionViewHandler({ section: 'productos' }));
    router.register('/dashboard/actores', 'dashboard-actores.html', () => dashboardSectionViewHandler({ section: 'actores' }));
    router.register('/dashboard/directores', 'dashboard-actores.html', () => dashboardSectionViewHandler({ section: 'directores' }));
    router.register('/dashboard/idiomas', 'dashboard-actores.html', () => dashboardSectionViewHandler({ section: 'idiomas' }));
    router.register('/dashboard/funciones', 'dashboard-actores.html', () => dashboardSectionViewHandler({ section: 'funciones' }));

    // Initialize router
    router.init();

    // Setup logout button (delegated event)
    document.addEventListener('click', (e) => {
        if (e.target.id === 'logout-btn' || e.target.closest('#logout-btn')) {
            auth.logout();
            router.navigate('/');
        }
    });

    // Setup navigation links
    document.addEventListener('click', (e) => {
        const link = e.target.closest('.nav-link');
        if (link) {
            e.preventDefault();
            const href = link.getAttribute('href');
            if (href) {
                router.navigate(href.replace('#', ''));
            }
        }
    });
});

// ==================== VIEW HANDLERS ====================

// Home View Handler
async function homeViewHandler() {
    let movies = [];
    let apiError = false;
    try {
        movies = await api.getMovies();
    } catch (error) {
        console.error('Error loading movies:', error);
        apiError = true;
        document.getElementById('api-error-message')?.classList.remove('hidden');
    }

    if (apiError) return;

    if (movies.length === 0) {
        document.getElementById('no-movies-message')?.classList.remove('hidden');
        return;
    }

    const carouselContainer = document.getElementById('carousel-container');
    const carouselTrack = document.getElementById('carousel-track');
    const carouselDots = document.getElementById('carousel-dots');

    if (carouselContainer && carouselTrack) {
        carouselContainer.classList.remove('hidden');
        
        carouselTrack.innerHTML = movies.slice(0, 10).map((movie, index) => `
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
        `).join('');

        if (movies.length > 1) {
            carouselDots.innerHTML = movies.slice(0, 10).map((_, index) => `
                <button class="carousel-dot w-2 h-2 rounded-full ${index === 0 ? 'bg-cine-red' : 'bg-gray-600'}" data-index="${index}"></button>
            `).join('');

            initCarousel();
        }
    }
}

function initCarousel() {
    let currentIndex = 0;
    const items = document.querySelectorAll('.carousel-item');
    const dots = document.querySelectorAll('.carousel-dot');
    const track = document.getElementById('carousel-track');

    function showSlide(index) {
        track.style.transform = `translateX(-${index * 100}%)`;
        dots.forEach((dot, i) => {
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

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentIndex = index;
            showSlide(currentIndex);
        });
    });

    // Auto-play
    setInterval(() => {
        currentIndex = (currentIndex + 1) % items.length;
        showSlide(currentIndex);
    }, 5000);
}

// Login View Handler
function loginViewHandler() {
    const form = document.getElementById('login-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const errorDiv = document.getElementById('login-error');
        errorDiv.classList.add('hidden');

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

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

// Register View Handler
function registerViewHandler() {
    const form = document.getElementById('register-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const errorDiv = document.getElementById('register-error');
        errorDiv.classList.add('hidden');

        const formData = {
            username: document.getElementById('reg-username').value.trim(),
            password: document.getElementById('reg-password').value,
            nombre: document.getElementById('reg-nombre').value.trim(),
            apellido: document.getElementById('reg-apellido').value.trim(),
            email: document.getElementById('reg-email').value.trim(),
            idTipoUsuario: 2
        };

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

// Movies View Handler
async function moviesViewHandler() {
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
        document.getElementById('api-error-message')?.classList.remove('hidden');
        return;
    }

    // Populate filters
    const genreFilter = document.getElementById('genre-filter');
    const languageFilter = document.getElementById('language-filter');
    const classificationFilter = document.getElementById('classification-filter');
    const audienceFilter = document.getElementById('audience-filter');

    genres.forEach(g => {
        const option = document.createElement('option');
        option.value = g.idGenero;
        option.textContent = sanitizeInput(g.nombre);
        genreFilter.appendChild(option);
    });

    languages.forEach(l => {
        const option = document.createElement('option');
        option.value = l.idIdioma;
        option.textContent = sanitizeInput(l.nombre);
        languageFilter.appendChild(option);
    });

    classifications.forEach(c => {
        const option = document.createElement('option');
        option.value = c.idClasificacion;
        option.textContent = sanitizeInput(c.nombre);
        classificationFilter.appendChild(option);
    });

    audienceTypes.forEach(a => {
        const option = document.createElement('option');
        option.value = a.idTipoPublico;
        option.textContent = sanitizeInput(a.nombre);
        audienceFilter.appendChild(option);
    });

    let filteredMovies = [...movies];
    renderMoviesGrid(filteredMovies);

    // Search functionality
    const searchInput = document.getElementById('search-input');
    const searchDebounced = debounce(async (query) => {
        if (query.length >= 2) {
            try {
                filteredMovies = await api.searchMovies(query);
                renderMoviesGrid(filteredMovies);
            } catch (error) {
                console.error('Search error:', error);
            }
        } else {
            filteredMovies = movies;
            renderMoviesGrid(filteredMovies);
        }
    }, 300);

    searchInput.addEventListener('input', (e) => {
        searchDebounced(e.target.value);
    });

    // Filter functionality
    function applyFilters() {
        const genreFilterVal = genreFilter.value;
        const languageFilterVal = languageFilter.value;
        const classificationFilterVal = classificationFilter.value;
        const audienceFilterVal = audienceFilter.value;
        const durationFilterVal = document.getElementById('duration-filter').value;

        filteredMovies = movies.filter(movie => {
            if (genreFilterVal && !movie.peliculasGeneros?.some(pg => pg.idGenero == genreFilterVal)) return false;
            if (languageFilterVal && !movie.peliculasIdiomas?.some(pi => pi.idIdioma == languageFilterVal)) return false;
            if (classificationFilterVal && movie.idClasificacion != classificationFilterVal) return false;
            if (audienceFilterVal && movie.idTipoPublico != audienceFilterVal) return false;
            if (durationFilterVal && movie.duracion < parseInt(durationFilterVal)) return false;
            return true;
        });

        renderMoviesGrid(filteredMovies);
    }

    genreFilter.addEventListener('change', applyFilters);
    languageFilter.addEventListener('change', applyFilters);
    classificationFilter.addEventListener('change', applyFilters);
    audienceFilter.addEventListener('change', applyFilters);
    document.getElementById('duration-filter').addEventListener('input', applyFilters);
}

function renderMoviesGrid(movies) {
    const grid = document.getElementById('movies-grid');
    if (!grid) return;

    if (movies.length === 0) {
        grid.innerHTML = '<div class="col-span-full text-center py-12 text-gray-400">No se encontraron películas</div>';
        return;
    }

    grid.innerHTML = movies.map(movie => `
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

// Movie Detail Handler
async function movieDetailViewHandler(params) {
    const movieId = params.id;
    const content = document.getElementById('movie-detail-content');
    if (!content) return;

    try {
        const movie = await api.getMovie(movieId);
        content.innerHTML = `
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
                    </div>
                    <a href="#/comprar?pelicula=${movie.idPelicula}" class="inline-block bg-cine-red px-6 py-3 rounded hover:bg-red-700 transition font-bold">
                        Comprar Entradas
                    </a>
                </div>
            </div>
        `;
    } catch (error) {
        content.innerHTML = `
            <div class="bg-red-900 bg-opacity-50 border border-red-500 rounded p-4">
                <p>Error al cargar la película: ${error.message}</p>
            </div>
        `;
    }
}

// Candy View Handler
async function candyViewHandler() {
    const grid = document.getElementById('products-grid');
    if (!grid) return;

    try {
        const products = await api.getProducts();
        if (products.length === 0) {
            grid.innerHTML = '<div class="col-span-full text-center py-12 text-gray-400">No hay productos disponibles</div>';
            return;
        }

        grid.innerHTML = products.map(product => `
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
        `).join('');
    } catch (error) {
        grid.innerHTML = '<div class="col-span-full text-center py-12 text-red-400">Error al cargar productos</div>';
    }
}

// Candy Detail Handler
async function candyDetailViewHandler(params) {
    const productId = params.id;
    const content = document.getElementById('product-detail-content');
    if (!content) return;

    try {
        const product = await api.getProduct(productId);
        content.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="w-full h-96 bg-gray-700 rounded flex items-center justify-center">
                    <span class="text-gray-400">Imagen del Producto</span>
                </div>
                <div>
                    <h1 class="text-4xl font-bold mb-4">${sanitizeInput(product.nombre || 'Sin nombre')}</h1>
                    <p class="text-gray-300 mb-6 text-xl">${formatCurrency(product.precio || 0)}</p>
                    <p class="text-gray-300 mb-6">${sanitizeInput(product.descripcion || 'Sin descripción')}</p>
                    <button onclick="addToCart(${product.idProducto})" 
                            class="bg-cine-red px-6 py-3 rounded hover:bg-red-700 transition font-bold">
                        Agregar al Carrito
                    </button>
                </div>
            </div>
        `;
    } catch (error) {
        content.innerHTML = `
            <div class="bg-red-900 bg-opacity-50 border border-red-500 rounded p-4">
                <p>Error al cargar el producto: ${error.message}</p>
            </div>
        `;
    }
}

// Purchase Handler (simplified - would need full implementation)
function purchaseViewHandler() {
    const container = document.getElementById('purchase-container');
    if (!container) return;
    
    if (!auth.isAuthenticated()) {
        showNotification('Debes iniciar sesión para comprar entradas', 'error');
        router.navigate('/login');
        return;
    }

    container.innerHTML = '<p class="text-center text-gray-400">Proceso de compra (implementar con pasos)</p>';
}

// Dashboard Handler
async function dashboardViewHandler() {
    if (!auth.isAdmin()) {
        showNotification('Acceso denegado. Solo administradores pueden acceder al dashboard.', 'error');
        router.navigate('/');
        return;
    }

    initDashboardMobileMenu();
    updateDashboardNavLinks('/dashboard');

    try {
        const analytics = await api.getAnalytics();
        const cardsContainer = document.getElementById('analytics-cards');
        if (cardsContainer) {
            cardsContainer.innerHTML = `
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
            `;
        }
    } catch (error) {
        console.error('Error loading analytics:', error);
    }
}

// Dashboard Section Handler
async function dashboardSectionViewHandler(params) {
    if (!auth.isAdmin()) {
        showNotification('Acceso denegado', 'error');
        router.navigate('/');
        return;
    }

    const section = params.section;
    initDashboardMobileMenu();
    updateDashboardNavLinks(`/dashboard/${section}`);

    switch (section) {
        case 'peliculas':
            await loadMoviesCRUD();
            break;
        case 'productos':
            await loadProductsCRUD();
            break;
        case 'actores':
            await loadActorsCRUD();
            break;
        case 'directores':
            await loadDirectorsCRUD();
            break;
        case 'idiomas':
            await loadLanguagesCRUD();
            break;
        case 'funciones':
            await loadFunctionsCRUD();
            break;
        default:
            router.navigate('/dashboard');
    }
}

function initDashboardMobileMenu() {
    const toggle = document.getElementById('mobile-menu-toggle');
    const menu = document.getElementById('mobile-menu');
    
    if (toggle && menu) {
        // Remove existing listeners
        const newToggle = toggle.cloneNode(true);
        toggle.parentNode.replaceChild(newToggle, toggle);
        
        newToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            menu.classList.toggle('hidden');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!menu.contains(e.target) && !newToggle.contains(e.target)) {
                menu.classList.add('hidden');
            }
        });
    }
}

function updateDashboardNavLinks(activePath) {
    document.querySelectorAll('.dashboard-nav-link').forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.replace('#', '') === activePath) {
            link.classList.add('bg-gray-800', 'text-cine-red');
            link.classList.remove('text-white');
        } else {
            link.classList.remove('bg-gray-800', 'text-cine-red');
            link.classList.add('text-white');
        }
    });
}

async function loadMoviesCRUD() {
    const container = document.getElementById('movies-table-container');
    if (!container) return;

    try {
        const movies = await api.getMovies();
        container.innerHTML = `
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
        `;

        // Load modal
        await loadModal('movie-modal.html');
    } catch (error) {
        container.innerHTML = `<div class="p-4 text-red-400">Error al cargar películas: ${error.message}</div>`;
    }
}

let movieModalInitialized = false;
let productModalInitialized = false;
let actorModalInitialized = false;

async function loadModal(modalFile) {
    const modalId = modalFile.replace('.html', '');
    if (document.getElementById(modalId)) return; // Already loaded
    
    try {
        const response = await fetch(`/views/modals/${modalFile}`);
        const html = await response.text();
        document.body.insertAdjacentHTML('beforeend', html);
        
        if (modalId === 'movie-modal' && !movieModalInitialized) {
            initMovieModal();
            movieModalInitialized = true;
        } else if (modalId === 'product-modal' && !productModalInitialized) {
            initProductModal();
            productModalInitialized = true;
        } else if (modalId === 'actor-modal' && !actorModalInitialized) {
            initActorModal();
            actorModalInitialized = true;
        }
    } catch (error) {
        console.error('Error loading modal:', error);
    }
}

function initMovieModal() {
    const form = document.getElementById('movie-form');
    if (!form) return;

    // Remove existing listeners to avoid duplicates
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);

    newForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const errorDiv = document.getElementById('movie-form-error');
        errorDiv.classList.add('hidden');

        const movieId = document.getElementById('movie-id').value;
        const formData = {
            nombre: document.getElementById('movie-nombre').value.trim(),
            descripcion: document.getElementById('movie-descripcion').value.trim(),
            duracion: parseInt(document.getElementById('movie-duracion').value),
            fechaEstreno: document.getElementById('movie-fecha-estreno').value,
            idClasificacion: parseInt(document.getElementById('movie-clasificacion').value),
            idTipoPublico: parseInt(document.getElementById('movie-tipo-publico').value)
        };

        const validation = validateForm(formData, {
            nombre: { required: true, label: 'Nombre' },
            descripcion: { required: true, label: 'Descripción' },
            duracion: { required: true, type: 'number', min: 1, label: 'Duración' },
            fechaEstreno: { required: true, label: 'Fecha de Estreno' },
            idClasificacion: { required: true, type: 'number', label: 'Clasificación' },
            idTipoPublico: { required: true, type: 'number', label: 'Tipo de Público' }
        });

        if (!validation.isValid) {
            errorDiv.textContent = Object.values(validation.errors)[0];
            errorDiv.classList.remove('hidden');
            return;
        }

        try {
            if (movieId) {
                await api.updateMovie(movieId, formData);
                showNotification('Película actualizada exitosamente', 'success');
            } else {
                await api.createMovie(formData);
                showNotification('Película creada exitosamente', 'success');
            }
            closeMovieModal();
            loadMoviesCRUD();
        } catch (error) {
            errorDiv.textContent = error.message;
            errorDiv.classList.remove('hidden');
        }
    });
}

// Global functions for modals
window.showMovieModal = async function(movieId = null) {
    await loadModal('movie-modal.html');
    const modal = document.getElementById('movie-modal');
    if (!modal) return;
    
    // Load reference data for selects
    try {
        const [classifications, audienceTypes] = await Promise.all([
            api.getClassifications(),
            api.getAudienceTypes()
        ]);

        const clasificacionSelect = document.getElementById('movie-clasificacion');
        const tipoPublicoSelect = document.getElementById('movie-tipo-publico');
        
        clasificacionSelect.innerHTML = '<option value="">Seleccionar...</option>' +
            classifications.map(c => `<option value="${c.idClasificacion}">${sanitizeInput(c.nombre)}</option>`).join('');
        
        tipoPublicoSelect.innerHTML = '<option value="">Seleccionar...</option>' +
            audienceTypes.map(a => `<option value="${a.idTipoPublico}">${sanitizeInput(a.nombre)}</option>`).join('');

        if (movieId) {
            const movie = await api.getMovie(movieId);
            document.getElementById('movie-modal-title').textContent = 'Editar Película';
            document.getElementById('movie-id').value = movieId;
            document.getElementById('movie-nombre').value = movie.nombre || '';
            document.getElementById('movie-descripcion').value = movie.descripcion || '';
            document.getElementById('movie-duracion').value = movie.duracion || '';
            document.getElementById('movie-fecha-estreno').value = movie.fechaEstreno ? new Date(movie.fechaEstreno).toISOString().split('T')[0] : '';
            clasificacionSelect.value = movie.idClasificacion || '';
            tipoPublicoSelect.value = movie.idTipoPublico || '';
        } else {
            document.getElementById('movie-modal-title').textContent = 'Agregar Película';
            document.getElementById('movie-form').reset();
            document.getElementById('movie-id').value = '';
        }
    } catch (error) {
        console.error('Error loading modal data:', error);
    }
    
    modal.classList.remove('hidden');
};

window.closeMovieModal = function() {
    const modal = document.getElementById('movie-modal');
    if (modal) {
        modal.classList.add('hidden');
        document.getElementById('movie-form')?.reset();
    }
};

// Close modals when clicking outside
document.addEventListener('click', (e) => {
    const movieModal = document.getElementById('movie-modal');
    const productModal = document.getElementById('product-modal');
    const actorModal = document.getElementById('actor-modal');
    
    if (movieModal && e.target === movieModal) {
        closeMovieModal();
    }
    if (productModal && e.target === productModal) {
        closeProductModal();
    }
    if (actorModal && e.target === actorModal) {
        closeActorModal();
    }
});

window.editMovie = function(movieId) {
    showMovieModal(movieId);
};

window.deleteMovie = async function(movieId) {
    if (confirm('¿Estás seguro de eliminar esta película?')) {
        try {
            await api.deleteMovie(movieId);
            showNotification('Película eliminada', 'success');
            loadMoviesCRUD();
        } catch (error) {
            showNotification('Error al eliminar película', 'error');
        }
    }
};

window.addToCart = function(productId) {
    cart.addProduct(productId, 1);
    showNotification('Producto agregado al carrito', 'success');
};

window.applyAnalyticsFilters = async function() {
    const filters = {
        fechaInicio: document.getElementById('filter-date-start')?.value,
        fechaFin: document.getElementById('filter-date-end')?.value,
        montoMinimo: document.getElementById('filter-amount-min')?.value,
        montoMaximo: document.getElementById('filter-amount-max')?.value
    };

    try {
        const analytics = await api.getAnalytics(filters);
        showNotification('Filtros aplicados', 'success');
        dashboardViewHandler();
    } catch (error) {
        showNotification('Error al aplicar filtros', 'error');
    }
};

// Products CRUD
async function loadProductsCRUD() {
    const container = document.getElementById('products-table-container');
    if (!container) return;

    try {
        const products = await api.getProducts();
        container.innerHTML = `
            <table class="w-full">
                <thead class="bg-gray-800">
                    <tr>
                        <th class="px-6 py-3 text-left">ID</th>
                        <th class="px-6 py-3 text-left">Nombre</th>
                        <th class="px-6 py-3 text-left">Precio</th>
                        <th class="px-6 py-3 text-left">Tipo</th>
                        <th class="px-6 py-3 text-left">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${products.map(product => `
                        <tr class="border-t border-gray-700 hover:bg-gray-800">
                            <td class="px-6 py-4">${product.idProducto}</td>
                            <td class="px-6 py-4">${sanitizeInput(product.nombre)}</td>
                            <td class="px-6 py-4">${formatCurrency(product.precio)}</td>
                            <td class="px-6 py-4">${product.idTipoProductoNavigation?.nombre || 'N/A'}</td>
                            <td class="px-6 py-4">
                                <button onclick="editProduct(${product.idProducto})" class="text-blue-400 hover:text-blue-300 mr-4">Editar</button>
                                <button onclick="deleteProduct(${product.idProducto})" class="text-red-400 hover:text-red-300">Eliminar</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        await loadModal('product-modal.html');
    } catch (error) {
        container.innerHTML = `<div class="p-4 text-red-400">Error al cargar productos: ${error.message}</div>`;
    }
}

// Actors CRUD
async function loadActorsCRUD() {
    const container = document.getElementById('actors-table-container');
    if (!container) return;
    
    // Update title and button
    const title = document.querySelector('main h1');
    const btn = document.querySelector('main button');
    if (title) title.textContent = 'Gestión de Actores';
    if (btn) {
        btn.textContent = '+ Agregar Actor';
        btn.setAttribute('onclick', 'showActorModal()');
    }

    try {
        const actors = await api.getActors();
        container.innerHTML = `
            <table class="w-full">
                <thead class="bg-gray-800">
                    <tr>
                        <th class="px-6 py-3 text-left">ID</th>
                        <th class="px-6 py-3 text-left">Nombre</th>
                        <th class="px-6 py-3 text-left">Apellido</th>
                        <th class="px-6 py-3 text-left">País</th>
                        <th class="px-6 py-3 text-left">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${actors.map(actor => `
                        <tr class="border-t border-gray-700 hover:bg-gray-800">
                            <td class="px-6 py-4">${actor.idActor}</td>
                            <td class="px-6 py-4">${sanitizeInput(actor.nombre)}</td>
                            <td class="px-6 py-4">${sanitizeInput(actor.apellido)}</td>
                            <td class="px-6 py-4">${actor.idPaisNavigation?.nombre || 'N/A'}</td>
                            <td class="px-6 py-4">
                                <button onclick="editActor(${actor.idActor})" class="text-blue-400 hover:text-blue-300 mr-4">Editar</button>
                                <button onclick="deleteActor(${actor.idActor})" class="text-red-400 hover:text-red-300">Eliminar</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        await loadModal('actor-modal.html');
    } catch (error) {
        container.innerHTML = `<div class="p-4 text-red-400">Error al cargar actores: ${error.message}</div>`;
    }
}

// Directors CRUD (similar to actors)
async function loadDirectorsCRUD() {
    const container = document.getElementById('actors-table-container');
    if (!container) return;
    
    // Update title and button
    const title = document.querySelector('main h1');
    const btn = document.querySelector('main button');
    if (title) title.textContent = 'Gestión de Directores';
    if (btn) {
        btn.textContent = '+ Agregar Director';
        btn.setAttribute('onclick', 'showDirectorModal()');
    }

    try {
        const directors = await api.getDirectors();
        container.innerHTML = `
            <table class="w-full">
                <thead class="bg-gray-800">
                    <tr>
                        <th class="px-6 py-3 text-left">ID</th>
                        <th class="px-6 py-3 text-left">Nombre</th>
                        <th class="px-6 py-3 text-left">Apellido</th>
                        <th class="px-6 py-3 text-left">País</th>
                        <th class="px-6 py-3 text-left">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${directors.map(director => `
                        <tr class="border-t border-gray-700 hover:bg-gray-800">
                            <td class="px-6 py-4">${director.idDirector}</td>
                            <td class="px-6 py-4">${sanitizeInput(director.nombre)}</td>
                            <td class="px-6 py-4">${sanitizeInput(director.apellido)}</td>
                            <td class="px-6 py-4">${director.idPaisNavigation?.nombre || 'N/A'}</td>
                            <td class="px-6 py-4">
                                <button onclick="editDirector(${director.idDirector})" class="text-blue-400 hover:text-blue-300 mr-4">Editar</button>
                                <button onclick="deleteDirector(${director.idDirector})" class="text-red-400 hover:text-red-300">Eliminar</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        container.innerHTML = `<div class="p-4 text-red-400">Error al cargar directores: ${error.message}</div>`;
    }
}

// Languages CRUD
async function loadLanguagesCRUD() {
    const container = document.getElementById('actors-table-container');
    if (!container) return;
    
    // Update title and button
    const title = document.querySelector('main h1');
    const btn = document.querySelector('main button');
    if (title) title.textContent = 'Gestión de Idiomas';
    if (btn) {
        btn.textContent = '+ Agregar Idioma';
        btn.setAttribute('onclick', 'showLanguageModal()');
    }

    try {
        const languages = await api.getLanguages();
        container.innerHTML = `
            <table class="w-full">
                <thead class="bg-gray-800">
                    <tr>
                        <th class="px-6 py-3 text-left">ID</th>
                        <th class="px-6 py-3 text-left">Nombre</th>
                        <th class="px-6 py-3 text-left">Subtitulado</th>
                        <th class="px-6 py-3 text-left">Doblado</th>
                        <th class="px-6 py-3 text-left">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${languages.map(lang => `
                        <tr class="border-t border-gray-700 hover:bg-gray-800">
                            <td class="px-6 py-4">${lang.idIdioma}</td>
                            <td class="px-6 py-4">${sanitizeInput(lang.nombre)}</td>
                            <td class="px-6 py-4">${lang.subtitulado ? 'Sí' : 'No'}</td>
                            <td class="px-6 py-4">${lang.doblado ? 'Sí' : 'No'}</td>
                            <td class="px-6 py-4">
                                <button onclick="editLanguage(${lang.idIdioma})" class="text-blue-400 hover:text-blue-300 mr-4">Editar</button>
                                <button onclick="deleteLanguage(${lang.idIdioma})" class="text-red-400 hover:text-red-300">Eliminar</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        container.innerHTML = `<div class="p-4 text-red-400">Error al cargar idiomas: ${error.message}</div>`;
    }
}

// Functions CRUD
async function loadFunctionsCRUD() {
    const container = document.getElementById('actors-table-container');
    if (!container) return;
    
    // Update title and button
    const title = document.querySelector('main h1');
    const btn = document.querySelector('main button');
    if (title) title.textContent = 'Gestión de Funciones';
    if (btn) {
        btn.textContent = '+ Agregar Función';
        btn.setAttribute('onclick', 'showFunctionModal()');
    }

    try {
        const functions = await api.getFunctions();
        container.innerHTML = `
            <table class="w-full">
                <thead class="bg-gray-800">
                    <tr>
                        <th class="px-6 py-3 text-left">ID</th>
                        <th class="px-6 py-3 text-left">Película</th>
                        <th class="px-6 py-3 text-left">Fecha/Hora</th>
                        <th class="px-6 py-3 text-left">Precio</th>
                        <th class="px-6 py-3 text-left">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${functions.map(func => `
                        <tr class="border-t border-gray-700 hover:bg-gray-800">
                            <td class="px-6 py-4">${func.idFuncion}</td>
                            <td class="px-6 py-4">${func.idPeliculaNavigation?.nombre || 'N/A'}</td>
                            <td class="px-6 py-4">${formatDateTime(func.fechaHoraInicio)}</td>
                            <td class="px-6 py-4">${formatCurrency(func.precioBase)}</td>
                            <td class="px-6 py-4">
                                <button onclick="editFunction(${func.idFuncion})" class="text-blue-400 hover:text-blue-300 mr-4">Editar</button>
                                <button onclick="deleteFunction(${func.idFuncion})" class="text-red-400 hover:text-red-300">Eliminar</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        container.innerHTML = `<div class="p-4 text-red-400">Error al cargar funciones: ${error.message}</div>`;
    }
}

function initProductModal() {
    const form = document.getElementById('product-form');
    if (!form) return;

    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);

    newForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const errorDiv = document.getElementById('product-form-error');
        errorDiv.classList.add('hidden');

        const productId = document.getElementById('product-id').value;
        const formData = {
            nombre: document.getElementById('product-nombre').value.trim(),
            descripcion: document.getElementById('product-descripcion').value.trim(),
            precio: parseFloat(document.getElementById('product-precio').value),
            idTipoProducto: parseInt(document.getElementById('product-tipo').value)
        };

        const validation = validateForm(formData, {
            nombre: { required: true, label: 'Nombre' },
            descripcion: { required: true, label: 'Descripción' },
            precio: { required: true, type: 'decimal', min: 0, label: 'Precio' },
            idTipoProducto: { required: true, type: 'number', label: 'Tipo de Producto' }
        });

        if (!validation.isValid) {
            errorDiv.textContent = Object.values(validation.errors)[0];
            errorDiv.classList.remove('hidden');
            return;
        }

        try {
            if (productId) {
                await api.updateProduct(productId, formData);
                showNotification('Producto actualizado exitosamente', 'success');
            } else {
                await api.createProduct(formData);
                showNotification('Producto creado exitosamente', 'success');
            }
            closeProductModal();
            loadProductsCRUD();
        } catch (error) {
            errorDiv.textContent = error.message;
            errorDiv.classList.remove('hidden');
        }
    });
}

function initActorModal() {
    const form = document.getElementById('actor-form');
    if (!form) return;

    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);

    newForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const errorDiv = document.getElementById('actor-form-error');
        errorDiv.classList.add('hidden');

        const actorId = document.getElementById('actor-id').value;
        const formData = {
            nombre: document.getElementById('actor-nombre').value.trim(),
            apellido: document.getElementById('actor-apellido').value.trim(),
            idPais: parseInt(document.getElementById('actor-pais').value)
        };

        const validation = validateForm(formData, {
            nombre: { required: true, label: 'Nombre' },
            apellido: { required: true, label: 'Apellido' },
            idPais: { required: true, type: 'number', label: 'País' }
        });

        if (!validation.isValid) {
            errorDiv.textContent = Object.values(validation.errors)[0];
            errorDiv.classList.remove('hidden');
            return;
        }

        try {
            if (actorId) {
                await api.updateActor(actorId, formData);
                showNotification('Actor actualizado exitosamente', 'success');
            } else {
                await api.createActor(formData);
                showNotification('Actor creado exitosamente', 'success');
            }
            closeActorModal();
            loadActorsCRUD();
        } catch (error) {
            errorDiv.textContent = error.message;
            errorDiv.classList.remove('hidden');
        }
    });
}

// Global functions for products
window.showProductModal = async function(productId = null) {
    await loadModal('product-modal.html');
    const modal = document.getElementById('product-modal');
    if (!modal) return;
    
    try {
        if (productId) {
            const product = await api.getProduct(productId);
            document.getElementById('product-modal-title').textContent = 'Editar Producto';
            document.getElementById('product-id').value = productId;
            document.getElementById('product-nombre').value = product.nombre || '';
            document.getElementById('product-descripcion').value = product.descripcion || '';
            document.getElementById('product-precio').value = product.precio || '';
            document.getElementById('product-tipo').value = product.idTipoProducto || '';
        } else {
            document.getElementById('product-modal-title').textContent = 'Agregar Producto';
            document.getElementById('product-form').reset();
            document.getElementById('product-id').value = '';
        }
    } catch (error) {
        console.error('Error loading modal data:', error);
    }
    
    modal.classList.remove('hidden');
};

window.closeProductModal = function() {
    const modal = document.getElementById('product-modal');
    if (modal) {
        modal.classList.add('hidden');
        document.getElementById('product-form')?.reset();
    }
};

window.editProduct = function(productId) {
    showProductModal(productId);
};

window.deleteProduct = async function(productId) {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
        try {
            await api.deleteProduct(productId);
            showNotification('Producto eliminado', 'success');
            loadProductsCRUD();
        } catch (error) {
            showNotification('Error al eliminar producto', 'error');
        }
    }
};

// Global functions for actors
window.showActorModal = async function(actorId = null) {
    await loadModal('actor-modal.html');
    const modal = document.getElementById('actor-modal');
    if (!modal) return;
    
    try {
        // Load countries for select (assuming there's an API endpoint)
        // For now, placeholder
        
        if (actorId) {
            const actors = await api.getActors();
            const actor = actors.find(a => a.idActor === actorId);
            document.getElementById('actor-modal-title').textContent = 'Editar Actor';
            document.getElementById('actor-id').value = actorId;
            document.getElementById('actor-nombre').value = actor?.nombre || '';
            document.getElementById('actor-apellido').value = actor?.apellido || '';
            document.getElementById('actor-pais').value = actor?.idPais || '';
        } else {
            document.getElementById('actor-modal-title').textContent = 'Agregar Actor';
            document.getElementById('actor-form').reset();
            document.getElementById('actor-id').value = '';
        }
    } catch (error) {
        console.error('Error loading modal data:', error);
    }
    
    modal.classList.remove('hidden');
};

window.closeActorModal = function() {
    const modal = document.getElementById('actor-modal');
    if (modal) {
        modal.classList.add('hidden');
        document.getElementById('actor-form')?.reset();
    }
};

window.editActor = function(actorId) {
    showActorModal(actorId);
};

window.deleteActor = async function(actorId) {
    if (confirm('¿Estás seguro de eliminar este actor?')) {
        try {
            await api.deleteActor(actorId);
            showNotification('Actor eliminado', 'success');
            loadActorsCRUD();
        } catch (error) {
            showNotification('Error al eliminar actor', 'error');
        }
    }
};

// Placeholder functions for directors, languages and functions
window.showDirectorModal = function() { showNotification('Modal de director en desarrollo', 'info'); };
window.showLanguageModal = function() { showNotification('Modal de idioma en desarrollo', 'info'); };
window.showFunctionModal = function() { showNotification('Modal de función en desarrollo', 'info'); };
window.editDirector = function(id) { showNotification('Funcionalidad en desarrollo', 'info'); };
window.deleteDirector = async function(id) {
    if (confirm('¿Estás seguro de eliminar este director?')) {
        try {
            await api.deleteDirector(id);
            showNotification('Director eliminado', 'success');
            loadDirectorsCRUD();
        } catch (error) {
            showNotification('Error al eliminar director', 'error');
        }
    }
};
window.editLanguage = function(id) { showNotification('Funcionalidad en desarrollo', 'info'); };
window.deleteLanguage = async function(id) {
    if (confirm('¿Estás seguro de eliminar este idioma?')) {
        try {
            await api.deleteLanguage(id);
            showNotification('Idioma eliminado', 'success');
            loadLanguagesCRUD();
        } catch (error) {
            showNotification('Error al eliminar idioma', 'error');
        }
    }
};
window.editFunction = function(id) { showNotification('Funcionalidad en desarrollo', 'info'); };
window.deleteFunction = async function(id) {
    if (confirm('¿Estás seguro de eliminar esta función?')) {
        try {
            await api.deleteFunction(id);
            showNotification('Función eliminada', 'success');
            loadFunctionsCRUD();
        } catch (error) {
            showNotification('Error al eliminar función', 'error');
        }
    }
};
