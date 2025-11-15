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
            GeneroIds: generoIds.length > 0 ? generoIds : [],
            IdiomaIds: idiomaIds.length > 0 ? idiomaIds : [],
            ActorIds: actorIds.length > 0 ? actorIds : [],
            DirectorIds: directorIds.length > 0 ? directorIds : []
        };
        
        // Si es actualización, agregar IdPelicula (requerido por PeliculaUpdateDTO)
        if (movieId) {
            formData.IdPelicula = parseInt(movieId);
        }
        
        console.log("Form data to send:", formData); // Debug

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
                console.log("Updating movie with ID:", movieId, "Data:", formData);
                const result = await api.updateMovie(movieId, formData);
                console.log("Update result:", result);
                showNotification(
                    "Película actualizada exitosamente",
                    "success"
                );
            } else {
                console.log("Creating new movie with data:", formData);
                const result = await api.createMovie(formData);
                console.log("Create result:", result);
                showNotification("Película creada exitosamente", "success");
            }
            closeMovieModal();
            // Recargar la lista de películas
            if (typeof loadMoviesCRUD === 'function') {
                loadMoviesCRUD();
            } else if (window.loadMoviesCRUD) {
                window.loadMoviesCRUD();
            }
        } catch (error) {
            console.error("Error saving movie:", error);
            const errorMessage = error.message || "Error al guardar la película";
            errorDiv.textContent = errorMessage;
            errorDiv.classList.remove("hidden");
            showNotification(errorMessage, "error");
        }
    });
}

// Global functions for movie modal
window.showMovieModal = async function (movieId = null) {
    // Load modal only when needed (lazy loading)
    if (!document.getElementById("movie-modal")) {
        await loadModal("movie-modal.html");
    }
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
        const generoId = (g) => g.idGenero || g.IdGenero || g.id || g.Id;
        generosContainer.innerHTML = genres
            .map(
                (g) => {
                    const id = generoId(g);
                    return `<label class="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" value="${id}" class="rounded">
                        <span>${sanitizeInput(g.nombre || g.Nombre || "")}</span>
                    </label>`;
                }
            )
            .join("");

        // Idiomas (checkboxes)
        const idiomasContainer = document.getElementById("movie-idiomas");
        const idiomaId = (l) => l.idIdioma || l.IdIdioma || l.id || l.Id;
        idiomasContainer.innerHTML = languages
            .map(
                (l) => {
                    const id = idiomaId(l);
                    return `<label class="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" value="${id}" class="rounded">
                        <span>${sanitizeInput(l.nombre || l.Nombre || "")}</span>
                    </label>`;
                }
            )
            .join("");

        // Actores (checkboxes)
        const actoresContainer = document.getElementById("movie-actores");
        const actorId = (a) => a.idActor || a.IdActor || a.id || a.Id;
        actoresContainer.innerHTML = actors
            .map(
                (a) => {
                    const id = actorId(a);
                    const nombre = a.nombre || a.Nombre || "";
                    const apellido = a.apellido || a.Apellido || "";
                    return `<label class="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" value="${id}" class="rounded">
                        <span>${sanitizeInput(nombre + " " + apellido)}</span>
                    </label>`;
                }
            )
            .join("");

        // Directores (checkboxes)
        const directoresContainer = document.getElementById("movie-directores");
        const directorId = (d) => d.idDirector || d.IdDirector || d.id || d.Id;
        directoresContainer.innerHTML = directors
            .map(
                (d) => {
                    const id = directorId(d);
                    const nombre = d.nombre || d.Nombre || "";
                    const apellido = d.apellido || d.Apellido || "";
                    return `<label class="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" value="${id}" class="rounded">
                        <span>${sanitizeInput(nombre + " " + apellido)}</span>
                    </label>`;
                }
            )
            .join("");

        if (movieId) {
            const movie = await api.getMovie(movieId);
            console.log("Movie data received:", movie); // Debug
            
            document.getElementById("movie-modal-title").textContent =
                "Editar Película";
            document.getElementById("movie-id").value = movieId;
            document.getElementById("movie-nombre").value = movie.nombre || movie.Nombre || "";
            document.getElementById("movie-descripcion").value =
                movie.descripcion || movie.Descripcion || "";
            document.getElementById("movie-imagen").value = movie.imagen || movie.Imagen || "";
            document.getElementById("movie-duracion").value =
                movie.duracion || movie.Duracion || "";
            
            const fechaEstreno = movie.fechaEstreno || movie.FechaEstreno;
            document.getElementById("movie-fecha-estreno").value =
                fechaEstreno ? new Date(fechaEstreno).toISOString().split("T")[0] : "";
            
            const idClasificacion = movie.idClasificacion || movie.IdClasificacion;
            const idPais = movie.idPais || movie.IdPais;
            const idDistribuidora = movie.idDistribuidora || movie.IdDistribuidora;
            const idTipoPublico = movie.idTipoPublico || movie.IdTipoPublico;
            
            clasificacionSelect.value = idClasificacion || "";
            paisSelect.value = idPais || "";
            distribuidoraSelect.value = idDistribuidora || "";
            tipoPublicoSelect.value = idTipoPublico || "";
            
            // Función helper para marcar checkboxes
            const markCheckboxes = (container, selectedIds, typeName) => {
                if (!container) {
                    console.warn(`${typeName} container not found`);
                    return;
                }
                
                // Obtener todos los checkboxes disponibles
                const allCheckboxes = Array.from(container.querySelectorAll('input[type="checkbox"]'));
                console.log(`${typeName} - Available checkbox values:`, allCheckboxes.map(cb => cb.value));
                
                if (!Array.isArray(selectedIds) || selectedIds.length === 0) {
                    console.log(`${typeName} - No IDs to mark`);
                    return;
                }
                
                console.log(`${typeName} - IDs to mark:`, selectedIds);
                
                // Marcar los checkboxes correspondientes
                selectedIds.forEach(id => {
                    const idStr = String(id);
                    // Buscar el checkbox por valor exacto
                    const checkbox = allCheckboxes.find(cb => cb.value === idStr);
                    if (checkbox) {
                        checkbox.checked = true;
                        console.log(`✓ Marked ${typeName} checkbox with value: ${idStr}`);
                    } else {
                        console.warn(`✗ Checkbox not found for ${typeName} ID: ${idStr}`);
                    }
                });
            };
            
            // Esperar un momento para asegurar que los checkboxes estén en el DOM
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // Marcar géneros seleccionados usando los IDs
            // El backend devuelve generoIds (camelCase) o GeneroIds (PascalCase)
            const generoIds = movie.generoIds || movie.GeneroIds || [];
            markCheckboxes(generosContainer, generoIds, "Genero");
            
            // Marcar idiomas seleccionados
            const idiomaIds = movie.idiomaIds || movie.IdiomaIds || [];
            markCheckboxes(idiomasContainer, idiomaIds, "Idioma");
            
            // Marcar actores seleccionados
            const actorIds = movie.actorIds || movie.ActorIds || [];
            markCheckboxes(actoresContainer, actorIds, "Actor");
            
            // Marcar directores seleccionados
            const directorIds = movie.directorIds || movie.DirectorIds || [];
            markCheckboxes(directoresContainer, directorIds, "Director");
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

