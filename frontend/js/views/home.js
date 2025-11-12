// Home View Handler
async function homeViewHandler() {
    console.log("Iniciando homeViewHandler");

    console.log("Verificando elementos del DOM...");

    let errorMessage = document.getElementById("api-error-message");
    let noMoviesMessage = document.getElementById("no-movies-message");
    let carouselContainer = document.getElementById("carousel-container");
    let carouselTrack = document.getElementById("carousel-track");
    let carouselDots = document.getElementById("carousel-dots");

    console.log("Estado de los elementos:", {
        errorMessage: !!errorMessage,
        noMoviesMessage: !!noMoviesMessage,
        carouselContainer: !!carouselContainer,
        carouselTrack: !!carouselTrack,
        carouselDots: !!carouselDots,
    });

    if (!carouselContainer || !carouselTrack) {
        console.error("Required carousel elements not found");
        return;
    }

    if (!carouselDots) {
        console.log("Creando elemento carousel-dots...");
        let dotsContainer = document.createElement("div");
        dotsContainer.id = "carousel-dots";
        dotsContainer.className = "flex justify-center mt-4 space-x-2";
        carouselContainer.parentNode.insertBefore(
            dotsContainer,
            carouselContainer.nextSibling
        );
        carouselDots = document.getElementById("carousel-dots");
    }

    let movies = [];

    try {
        console.log("Intentando obtener películas de la API...");
        movies = await api.getMovies();
        console.log("Películas obtenidas:", movies);

        if (!movies || movies.length === 0) {
            noMoviesMessage?.classList.remove("hidden");
            return;
        }

        carouselContainer.classList.remove("hidden");

        carouselTrack.innerHTML = ""; // limpiar

        movies.slice(0, 10).forEach((movie, index) => {
            let item = document.createElement("div");
            item.className = `carousel-item min-w-full w-full flex-none active`;
            item.dataset.index = index;

            item.innerHTML = `
                <div class="bg-cine-gray rounded-lg p-6 flex items-center space-x-6 ">
                    <div class="w-48 h-64 rounded flex-shrink-0 flex items-center justify-center">
                        <img src=${movie.imagen} alt="${sanitizeInput(
                movie.nombre
            )}" class="w-full h-full object-cover rounded"/>
                    </div>
                    <div class="flex-1">
                        <h3 class="text-2xl font-bold mb-2">${sanitizeInput(
                            movie.nombre || "Sin título"
                        )}</h3>
                        <p class="text-gray-300 mb-4 line-clamp-3">${sanitizeInput(
                            movie.descripcion || "Sin descripción"
                        )}</p>
                        <div class="flex items-center space-x-4 text-sm text-gray-400">
                            <span>${formatDuration(movie.duracion || 0)}</span>
                            <span>•</span>
                            <span>${formatDate(movie.fechaEstreno)}</span>
                        </div>
                        <a href="#/peliculas/${
                            movie.idPelicula
                        }" class="inline-block mt-4 bg-cine-red px-6 py-2 rounded hover:bg-red-700 transition">
                            Ver Detalles
                        </a>
                    </div>
                </div>
            `;

            carouselTrack.appendChild(item);
        });

        console.log(
            "Items del carrusel creados:",
            carouselTrack.children.length
        );

        if (movies.length > 1) {
            carouselDots.innerHTML = ""; // limpiar

            movies.slice(0, 10).forEach((_, index) => {
                const dot = document.createElement("button");
                dot.className = `carousel-dot w-3 h-3 rounded-full mx-1 ${
                    index === 0 ? "bg-cine-red" : "bg-gray-600"
                }`;
                dot.dataset.index = index;
                carouselDots.appendChild(dot);
            });

            console.log("Dots creados:", carouselDots.children.length);

            // Inicializar carrusel cuando ya existe todo
            initCarousel();
        }
    } catch (error) {
        console.error("Error in homeViewHandler:", error);
        errorMessage?.classList.remove("hidden");
    }
}

function initCarousel() {
    console.log("Inicializando carrusel...");
    let currentIndex = 0;
    const items = document.querySelectorAll(".carousel-item");
    const dots = document.querySelectorAll(".carousel-dot");
    const track = document.getElementById("carousel-track");

    console.log("Elementos encontrados:", {
        items: items.length,
        dots: dots.length,
        track: !!track,
    });

    if (!track || items.length === 0 || dots.length === 0) {
        console.error("Faltan elementos necesarios para el carrusel");
        return;
    }

    function showSlide(index) {
        console.log(`Mostrando slide ${index}`);
        // Actualizar la posición del track
        track.style.transform = `translateX(-${index * 100}%)`;

        // Actualizar los dots
        dots.forEach((dot, i) => {
            if (i === index) {
                dot.classList.remove("bg-gray-600");
                dot.classList.add("bg-cine-red");
            } else {
                dot.classList.remove("bg-cine-red");
                dot.classList.add("bg-gray-600");
            }
        });
    }

    document.getElementById("carousel-prev")?.addEventListener("click", () => {
        currentIndex = (currentIndex - 1 + items.length) % items.length;
        showSlide(currentIndex);
    });

    document.getElementById("carousel-next")?.addEventListener("click", () => {
        currentIndex = (currentIndex + 1) % items.length;
        showSlide(currentIndex);
    });

    dots.forEach((dot, index) => {
        dot.addEventListener("click", () => {
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

