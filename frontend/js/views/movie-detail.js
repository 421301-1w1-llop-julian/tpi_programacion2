// Movie Detail Handler
async function movieDetailViewHandler(params) {
    const movieId = params.id;
    const content = document.getElementById("movie-detail-content");
    if (!content) return;

    try {
        const [movie, functions] = await Promise.all([
            api.getMovie(movieId),
            api.getFunctions(movieId),
        ]);

        // Generate date options (today to 1 month ahead)
        const dateOptions = generateDateOptions();

        content.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div class="w-full h-auto bg-gray-700 rounded flex items-center justify-center">
                    <img src=${movie.imagen} alt="${sanitizeInput(
            movie.nombre
        )}" class="w-full object-cover rounded"/>
                </div>
                <div>
                    <h1 class="text-4xl font-bold mb-4">${sanitizeInput(
                        movie.nombre || "Sin título"
                    )}</h1>
                    <p class="text-gray-300 mb-6">${sanitizeInput(
                        movie.descripcion || "Sin descripción"
                    )}</p>
                    <div class="space-y-2 mb-6">
                        <div><span class="font-semibold">Duración:</span> ${formatDuration(
                            movie.duracion || 0
                        )}</div>
                        <div><span class="font-semibold">Fecha de Estreno:</span> ${formatDate(
                            movie.fechaEstreno
                        )}</div>
                        <div><span class="font-semibold">Clasificación:</span> ${
                            movie.idClasificacionNavigation?.nombre || "N/A"
                        }</div>
                        <div><span class="font-semibold">Tipo de Público:</span> ${
                            movie.idTipoPublicoNavigation?.nombre || "N/A"
                        }</div>
                    </div>
                </div>
            </div>

            <!-- Date Selector and Filters -->
            <div class="bg-gray-800 rounded-lg p-6 mb-6">
                <div class="mb-4">
                    <label class="block text-sm font-semibold mb-2">Seleccionar Día</label>
                    <div id="date-selector" class="flex gap-2 overflow-x-auto pb-2">
                        ${dateOptions
                            .map(
                                (date, index) => `
                            <button 
                                type="button"
                                class="date-option flex-shrink-0 px-4 py-2 rounded ${
                                    index === 0
                                        ? "bg-cine-red text-white"
                                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                }"
                                data-date="${date.value}"
                            >
                                ${date.label}
                            </button>
                        `
                            )
                            .join("")}
                    </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-semibold mb-2">Formato</label>
                        <select id="format-filter" class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-cine-red">
                            <option value="">Todos los formatos</option>
                            <option value="2D">2D</option>
                            <option value="3D">3D</option>
                            <option value="4D">4D</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-semibold mb-2">Idioma</label>
                        <select id="language-filter" class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-cine-red">
                            <option value="">Todos los idiomas</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Showtimes -->
            <div id="showtimes-container" class="bg-gray-800 rounded-lg p-6">
                <h2 class="text-2xl font-bold mb-4">Horarios Disponibles</h2>
                <div id="showtimes-list"></div>
            </div>
        `;

        // Load languages for filter
        const languages = await api.getLanguages();
        const languageFilter = document.getElementById("language-filter");
        languages.forEach((lang) => {
            const option = document.createElement("option");
            option.value = lang.idIdioma;
            option.textContent = sanitizeInput(lang.nombre);
            languageFilter.appendChild(option);
        });

        // Setup event listeners
        setupMovieDetailListeners(movieId, functions, dateOptions[0].value);
    } catch (error) {
        content.innerHTML = `
            <div class="bg-red-900 bg-opacity-50 border border-red-500 rounded p-4">
                <p>Error al cargar la película: ${error.message}</p>
            </div>
        `;
    }
}

function generateDateOptions() {
    const options = [];
    const today = new Date();
    const oneMonthLater = new Date(today);
    oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);

    const days = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];
    const months = [
        "ENE",
        "FEB",
        "MAR",
        "ABR",
        "MAY",
        "JUN",
        "JUL",
        "AGO",
        "SEP",
        "OCT",
        "NOV",
        "DIC",
    ];

    for (let i = 0; i <= 30; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);

        const dayName = days[date.getDay()];
        const day = date.getDate();
        const month = months[date.getMonth()];

        let label;
        if (i === 0) {
            label = "HOY";
        } else if (i === 1) {
            label = "MAÑANA";
        } else {
            label = `${dayName} ${day}/${month}`;
        }

        options.push({
            label,
            value: date.toISOString().split("T")[0],
            date: date,
        });
    }

    return options;
}

function setupMovieDetailListeners(movieId, functions, selectedDate) {
    let currentDate = selectedDate;
    let currentFormat = "";
    let currentLanguage = "";

    // Date selector
    document.querySelectorAll(".date-option").forEach((btn) => {
        btn.addEventListener("click", () => {
            document
                .querySelectorAll(".date-option")
                .forEach((b) =>
                    b.classList.remove("bg-cine-red", "text-white")
                );
            document
                .querySelectorAll(".date-option")
                .forEach((b) =>
                    b.classList.add("bg-gray-700", "text-gray-300")
                );
            btn.classList.remove("bg-gray-700", "text-gray-300");
            btn.classList.add("bg-cine-red", "text-white");
            currentDate = btn.dataset.date;
            renderShowtimes(movieId, functions, currentDate, currentFormat, currentLanguage);
        });
    });

    // Format filter
    const formatFilter = document.getElementById("format-filter");
    formatFilter.addEventListener("change", (e) => {
        currentFormat = e.target.value;
        renderShowtimes(movieId, functions, currentDate, currentFormat, currentLanguage);
    });

    // Language filter
    const languageFilter = document.getElementById("language-filter");
    languageFilter.addEventListener("change", (e) => {
        currentLanguage = e.target.value;
        renderShowtimes(movieId, functions, currentDate, currentFormat, currentLanguage);
    });

    // Initial render
    renderShowtimes(movieId, functions, currentDate, currentFormat, currentLanguage);
}

function renderShowtimes(movieId, functions, selectedDate, formatFilter, languageFilter) {
    const showtimesList = document.getElementById("showtimes-list");
    if (!showtimesList) return;

        // Filter functions by date
        const selectedDateObj = new Date(selectedDate + "T00:00:00");
        const filteredFunctions = functions.filter((func) => {
            const funcDate = new Date(func.fechaHoraInicio);
            const funcDateOnly = new Date(funcDate.getFullYear(), funcDate.getMonth(), funcDate.getDate());
            const selectedDateOnly = new Date(selectedDateObj.getFullYear(), selectedDateObj.getMonth(), selectedDateObj.getDate());
            
            return (
                funcDateOnly.getTime() === selectedDateOnly.getTime() &&
                (!formatFilter || (func.formato || "2D") === formatFilter) &&
                (!languageFilter || (func.idiomaId || func.idIdioma) === parseInt(languageFilter))
            );
        });

    if (filteredFunctions.length === 0) {
        showtimesList.innerHTML =
            '<p class="text-gray-400 text-center py-8">No hay horarios disponibles para esta fecha</p>';
        return;
    }

    // Group by format and language (using defaults if not available)
    // Note: formato and idioma may not be in the function DTO, using defaults
    const grouped = {};
    filteredFunctions.forEach((func) => {
        // Default values - you may need to adjust based on your backend structure
        const format = func.formato || "2D";
        const language = func.idioma || func.idiomaId || "Castellano";
        const key = `${format}_${language}`;

        if (!grouped[key]) {
            grouped[key] = {
                format,
                language,
                showtimes: [],
            };
        }

        grouped[key].showtimes.push(func);
    });

    // Sort showtimes by time
    Object.keys(grouped).forEach((key) => {
        grouped[key].showtimes.sort(
            (a, b) =>
                new Date(a.fechaHoraInicio) - new Date(b.fechaHoraInicio)
        );
    });

    // Render grouped showtimes
    showtimesList.innerHTML = Object.values(grouped)
        .map(
            (group) => `
            <div class="mb-6">
                <h3 class="text-xl font-semibold mb-3">${group.format} ${group.language.toUpperCase()}</h3>
                <div class="flex flex-wrap gap-3">
                    ${group.showtimes
                        .map(
                            (func) => `
                        <button
                            class="showtime-btn bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded transition"
                            data-funcion-id="${func.idFuncion}"
                        >
                            ${formatTime(func.fechaHoraInicio)}
                        </button>
                    `
                        )
                        .join("")}
                </div>
            </div>
        `
        )
        .join("");

    // Add click listeners to showtime buttons
    document.querySelectorAll(".showtime-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            const funcionId = btn.dataset.funcionId;
            router.navigate(`/pelicula/${movieId}/compra_entradas/butacas?funcion=${funcionId}`);
        });
    });
}

// formatTime is now in utils.js
