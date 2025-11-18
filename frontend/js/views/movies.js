// Movies View Handler
async function moviesViewHandler(routeParams, queryParams) {
    let movies = [];
    let genres = [];
    let languages = [];
    let classifications = [];
    let audienceTypes = [];

    try {
        // Build filters object from queryParams passed by the router
        const filters = {};
        if (queryParams) {
            if (queryParams.get("GeneroId"))
                filters.GeneroId = queryParams.get("GeneroId");
            if (queryParams.get("IdiomaId"))
                filters.IdiomaId = queryParams.get("IdiomaId");
            if (queryParams.get("ClasificacionId"))
                filters.ClasificacionId = queryParams.get("ClasificacionId");
            if (queryParams.get("TipoPublicoId"))
                filters.TipoPublicoId = queryParams.get("TipoPublicoId");
            if (queryParams.get("MinDuration"))
                filters.MinDuration = queryParams.get("MinDuration");
            if (queryParams.get("search"))
                filters.Search = queryParams.get("search");
        }

        [movies, genres, languages, classifications, audienceTypes] =
            await Promise.all([
                api.getMovies(filters),
                api.getGenres(),
                api.getLanguages(),
                api.getClassifications(),
                api.getAudienceTypes(),
            ]);
    } catch (error) {
        console.error("Error loading data:", error);
        document
            .getElementById("api-error-message")
            ?.classList.remove("hidden");
        return;
    }

    // Populate filters
    const genreFilter = document.getElementById("genre-filter");
    const languageFilter = document.getElementById("language-filter");
    const classificationFilter = document.getElementById(
        "classification-filter"
    );
    const audienceFilter = document.getElementById("audience-filter");

    genres.forEach((g) => {
        const option = document.createElement("option");
        option.value = g.idGenero;
        option.textContent = sanitizeInput(g.nombre);
        genreFilter.appendChild(option);
    });

    languages.forEach((l) => {
        const option = document.createElement("option");
        option.value = l.idIdioma;
        option.textContent = sanitizeInput(l.nombre);
        languageFilter.appendChild(option);
    });

    classifications.forEach((c) => {
        const option = document.createElement("option");
        option.value = c.idClasificacion;
        option.textContent = sanitizeInput(c.nombre);
        classificationFilter.appendChild(option);
    });

    audienceTypes.forEach((a) => {
        const option = document.createElement("option");
        option.value = a.idTipoPublico;
        option.textContent = sanitizeInput(a.nombre);
        audienceFilter.appendChild(option);
    });

    // If there are query params, prefill the filter controls so filters accumulate
    if (queryParams) {
        const qGenero = queryParams.get("GeneroId");
        const qIdioma = queryParams.get("IdiomaId");
        const qClas = queryParams.get("ClasificacionId");
        const qTipo = queryParams.get("TipoPublicoId");
        const qMinDur = queryParams.get("MinDuration");
        const qSearch = queryParams.get("search");

        if (qGenero) genreFilter.value = qGenero;
        if (qIdioma) languageFilter.value = qIdioma;
        if (qClas) classificationFilter.value = qClas;
        if (qTipo) audienceFilter.value = qTipo;
        if (qMinDur) document.getElementById("duration-filter").value = qMinDur;
        if (qSearch) document.getElementById("search-input").value = qSearch;
    }

    let filteredMovies = [...movies];
    renderMoviesGrid(filteredMovies);

    // Search functionality: update URL with search param (debounced)
    const searchInput = document.getElementById("search-input");
    const searchDebounced = debounce((query) => {
        applyFilters();
    }, 600);

    searchInput.addEventListener("input", (e) => {
        searchDebounced(e.target.value);
    });

    // Filter functionality: when a filter changes, update the hash with search params
    function buildFiltersFromDOM() {
        const params = new URLSearchParams();
        const genreFilterVal = genreFilter.value;
        const languageFilterVal = languageFilter.value;
        const classificationFilterVal = classificationFilter.value;
        const audienceFilterVal = audienceFilter.value;
        const durationFilterVal =
            document.getElementById("duration-filter").value;
        const searchVal = document.getElementById("search-input").value;

        if (genreFilterVal) params.append("GeneroId", genreFilterVal);
        if (languageFilterVal) params.append("IdiomaId", languageFilterVal);
        if (classificationFilterVal)
            params.append("ClasificacionId", classificationFilterVal);
        if (audienceFilterVal)
            params.append("TipoPublicoId", audienceFilterVal);
        if (durationFilterVal) params.append("MinDuration", durationFilterVal);
        if (searchVal && searchVal.length >= 2)
            params.append("search", searchVal);

        return params;
    }

    function applyFilters() {
        const params = buildFiltersFromDOM();
        const hash = params.toString()
            ? `/peliculas?${params.toString()}`
            : "/peliculas";
        router.navigate(hash);
    }

    genreFilter.addEventListener("change", applyFilters);
    languageFilter.addEventListener("change", applyFilters);
    classificationFilter.addEventListener("change", applyFilters);
    audienceFilter.addEventListener("change", applyFilters);
    // Debounce duration input so user can type more than one digit
    const durationEl = document.getElementById("duration-filter");
    if (durationEl) {
        // Wait a short time after the user stops typing before applying filters
        const durationDebounced = debounce(() => {
            applyFilters();
        }, 600);

        durationEl.addEventListener("input", (e) => {
            // Allow the user to type freely; only trigger filters after debounce
            durationDebounced();
        });
    }
}

function renderMoviesGrid(movies) {
    const grid = document.getElementById("movies-grid");
    if (!grid) return;

    if (movies.length === 0) {
        grid.innerHTML =
            '<div class="col-span-full text-center py-12 text-gray-400">No se encontraron películas</div>';
        return;
    }

    grid.innerHTML = movies
        .map(
            (movie) => `
        <div class="w-[270px] bg-cine-gray rounded-lg overflow-hidden hover:transform hover:scale-105 transition cursor-pointer"
             onclick="router.navigate('/peliculas/${movie.idPelicula}')">
            <div class="flex items-center justify-center">
                <img src=${movie.imagen} alt="${sanitizeInput(
                movie.nombre
            )}" class="w-[270px] h-[400px] object-cover rounded"/>
            </div>
            <div class="p-2">
                <h3 class="text-lg font-bold mb-2">${sanitizeInput(
                    movie.nombre || "Sin título"
                )}</h3>
                <p class="text-sm text-gray-400 mb-2 line-clamp-2">${sanitizeInput(
                    movie.descripcion || ""
                )}</p>
                <div class="flex items-center justify-between text-sm text-gray-400">
                    <span>${formatDuration(movie.duracion || 0)}</span>
                    <span>${formatDate(movie.fechaEstreno)}</span>
                </div>
            </div>
        </div>
    `
        )
        .join("");
}
