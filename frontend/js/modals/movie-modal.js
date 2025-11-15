// Movie Modal Functions
function initMovieModal() {
    const form = document.getElementById("movie-form");
    if (!form) return;

    // Remove existing listeners to avoid duplicates
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);

    newForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const errorDiv = document.getElementById("movie-form-error");
        errorDiv.classList.add("hidden");

        const movieId = document.getElementById("movie-id").value;
        
        // Obtener géneros seleccionados
        const generoIds = Array.from(document.querySelectorAll('#movie-generos input[type="checkbox"]:checked'))
            .map(cb => parseInt(cb.value));
        
        // Obtener idiomas seleccionados
        const idiomaIds = Array.from(document.querySelectorAll('#movie-idiomas input[type="checkbox"]:checked'))
            .map(cb => parseInt(cb.value));
        
        // Obtener actores seleccionados
        const actorIds = Array.from(document.querySelectorAll('#movie-actores input[type="checkbox"]:checked'))
            .map(cb => parseInt(cb.value));
        
        // Obtener directores seleccionados
        const directorIds = Array.from(document.querySelectorAll('#movie-directores input[type="checkbox"]:checked'))
            .map(cb => parseInt(cb.value));
        
        // Preparar fecha de estreno (convertir a formato DateOnly si está presente)
        const fechaEstrenoValue = document.getElementById("movie-fecha-estreno").value;
        
        const formData = {
            Nombre: document.getElementById("movie-nombre").value.trim(),
            Descripcion: document.getElementById("movie-descripcion").value.trim(),
            Imagen: document.getElementById("movie-imagen")?.value.trim() || "",
            Duracion: parseInt(document.getElementById("movie-duracion").value),
            FechaEstreno: fechaEstrenoValue || null,
            IdClasificacion: parseInt(document.getElementById("movie-clasificacion").value),
            IdPais: parseInt(document.getElementById("movie-pais").value),
            IdDistribuidora: parseInt(document.getElementById("movie-distribuidora").value),
            IdTipoPublico: parseInt(document.getElementById("movie-tipo-publico").value),
            GeneroIds: generoIds.length > 0 ? generoIds : null,
            IdiomaIds: idiomaIds.length > 0 ? idiomaIds : null,
            ActorIds: actorIds.length > 0 ? actorIds : null,
            DirectorIds: directorIds.length > 0 ? directorIds : null
        };

        const validation = validateForm(formData, {
            Nombre: { required: true, label: "Nombre" },
            Descripcion: { required: true, label: "Descripción" },
            Duracion: {
                required: true,
                type: "number",
                min: 1,
                label: "Duración",
            },
            FechaEstreno: { required: true, label: "Fecha de Estreno" },
            IdClasificacion: {
                required: true,
                type: "number",
                label: "Clasificación",
            },
            IdPais: {
                required: true,
                type: "number",
                label: "País",
            },
            IdDistribuidora: {
                required: true,
                type: "number",
                label: "Distribuidora",
            },
            IdTipoPublico: {
                required: true,
                type: "number",
                label: "Tipo de Público",
            },
        });

        if (!validation.isValid) {
            errorDiv.textContent = Object.values(validation.errors)[0];
            errorDiv.classList.remove("hidden");
            return;
        }

        try {
            if (movieId) {
                await api.updateMovie(movieId, formData);
                showNotification(
                    "Película actualizada exitosamente",
                    "success"
                );
            } else {
                await api.createMovie(formData);
                showNotification("Película creada exitosamente", "success");
            }
            closeMovieModal();
            loadMoviesCRUD();
        } catch (error) {
            errorDiv.textContent = error.message;
            errorDiv.classList.remove("hidden");
        }
    });
}

// Global functions for movie modal
window.showMovieModal = async function (movieId = null) {
    await loadModal("movie-modal.html");
    const modal = document.getElementById("movie-modal");
    if (!modal) return;

    // Load reference data for selects
    try {
        const [classifications, audienceTypes, countries, distribuidoras, genres, languages, actors, directors] = await Promise.all([
            api.getClassifications(),
            api.getAudienceTypes(),
            api.getCountries(),
            api.getDistribuidoras(),
            api.getGenres(),
            api.getLanguages(),
            api.getActors(),
            api.getDirectors(),
        ]);

        // Clasificación
        const clasificacionSelect = document.getElementById("movie-clasificacion");
        clasificacionSelect.innerHTML =
            '<option value="">Seleccionar...</option>' +
            classifications
                .map(
                    (c) =>
                        `<option value="${c.idClasificacion}">${sanitizeInput(
                            c.nombre
                        )}</option>`
                )
                .join("");

        // Tipo de Público
        const tipoPublicoSelect = document.getElementById("movie-tipo-publico");
        tipoPublicoSelect.innerHTML =
            '<option value="">Seleccionar...</option>' +
            audienceTypes
                .map(
                    (a) =>
                        `<option value="${a.idTipoPublico}">${sanitizeInput(
                            a.nombre
                        )}</option>`
                )
                .join("");

        // País
        const paisSelect = document.getElementById("movie-pais");
        paisSelect.innerHTML =
            '<option value="">Seleccionar...</option>' +
            countries
                .map(
                    (p) =>
                        `<option value="${p.idPais}">${sanitizeInput(
                            p.nombre
                        )}</option>`
                )
                .join("");

        // Distribuidora
        const distribuidoraSelect = document.getElementById("movie-distribuidora");
        distribuidoraSelect.innerHTML =
            '<option value="">Seleccionar...</option>' +
            distribuidoras
                .map(
                    (d) =>
                        `<option value="${d.idDistribuidora}">${sanitizeInput(
                            d.nombre
                        )}</option>`
                )
                .join("");

        // Géneros (checkboxes)
        const generosContainer = document.getElementById("movie-generos");
        generosContainer.innerHTML = genres
            .map(
                (g) =>
                    `<label class="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" value="${g.idGenero}" class="rounded">
                        <span>${sanitizeInput(g.nombre)}</span>
                    </label>`
            )
            .join("");

        // Idiomas (checkboxes)
        const idiomasContainer = document.getElementById("movie-idiomas");
        idiomasContainer.innerHTML = languages
            .map(
                (l) =>
                    `<label class="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" value="${l.idIdioma}" class="rounded">
                        <span>${sanitizeInput(l.nombre)}</span>
                    </label>`
            )
            .join("");

        // Actores (checkboxes)
        const actoresContainer = document.getElementById("movie-actores");
        actoresContainer.innerHTML = actors
            .map(
                (a) =>
                    `<label class="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" value="${a.idActor}" class="rounded">
                        <span>${sanitizeInput(a.nombre + " " + (a.apellido || ""))}</span>
                    </label>`
            )
            .join("");

        // Directores (checkboxes)
        const directoresContainer = document.getElementById("movie-directores");
        directoresContainer.innerHTML = directors
            .map(
                (d) =>
                    `<label class="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" value="${d.idDirector}" class="rounded">
                        <span>${sanitizeInput(d.nombre + " " + (d.apellido || ""))}</span>
                    </label>`
            )
            .join("");

        if (movieId) {
            const movie = await api.getMovie(movieId);
            document.getElementById("movie-modal-title").textContent =
                "Editar Película";
            document.getElementById("movie-id").value = movieId;
            document.getElementById("movie-nombre").value = movie.nombre || "";
            document.getElementById("movie-descripcion").value =
                movie.descripcion || "";
            document.getElementById("movie-imagen").value = movie.imagen || "";
            document.getElementById("movie-duracion").value =
                movie.duracion || "";
            document.getElementById("movie-fecha-estreno").value =
                movie.fechaEstreno
                    ? new Date(movie.fechaEstreno).toISOString().split("T")[0]
                    : "";
            clasificacionSelect.value = movie.idClasificacion || "";
            paisSelect.value = movie.idPais || "";
            distribuidoraSelect.value = movie.idDistribuidora || "";
            tipoPublicoSelect.value = movie.idTipoPublico || "";
            
            // Marcar géneros seleccionados
            if (movie.generos && Array.isArray(movie.generos)) {
                movie.generos.forEach(g => {
                    const checkbox = generosContainer.querySelector(`input[value="${g.idGenero}"]`);
                    if (checkbox) checkbox.checked = true;
                });
            }
            
            // Marcar idiomas seleccionados
            if (movie.idiomas && Array.isArray(movie.idiomas)) {
                movie.idiomas.forEach(i => {
                    const checkbox = idiomasContainer.querySelector(`input[value="${i.idIdioma}"]`);
                    if (checkbox) checkbox.checked = true;
                });
            }
            
            // Marcar actores seleccionados
            if (movie.actores && Array.isArray(movie.actores)) {
                movie.actores.forEach(a => {
                    const checkbox = actoresContainer.querySelector(`input[value="${a.idActor}"]`);
                    if (checkbox) checkbox.checked = true;
                });
            }
            
            // Marcar directores seleccionados
            if (movie.directores && Array.isArray(movie.directores)) {
                movie.directores.forEach(d => {
                    const checkbox = directoresContainer.querySelector(`input[value="${d.idDirector}"]`);
                    if (checkbox) checkbox.checked = true;
                });
            }
        } else {
            document.getElementById("movie-modal-title").textContent =
                "Agregar Película";
            document.getElementById("movie-form").reset();
            document.getElementById("movie-id").value = "";
            
            // Limpiar checkboxes
            document.querySelectorAll('#movie-generos input[type="checkbox"]').forEach(cb => cb.checked = false);
            document.querySelectorAll('#movie-idiomas input[type="checkbox"]').forEach(cb => cb.checked = false);
            document.querySelectorAll('#movie-actores input[type="checkbox"]').forEach(cb => cb.checked = false);
            document.querySelectorAll('#movie-directores input[type="checkbox"]').forEach(cb => cb.checked = false);
        }
    } catch (error) {
        console.error("Error loading modal data:", error);
    }

    modal.classList.remove("hidden");
};

window.closeMovieModal = function () {
    const modal = document.getElementById("movie-modal");
    if (modal) {
        modal.classList.add("hidden");
        document.getElementById("movie-form")?.reset();
    }
};

