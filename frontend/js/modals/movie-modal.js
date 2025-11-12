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
        const formData = {
            nombre: document.getElementById("movie-nombre").value.trim(),
            descripcion: document
                .getElementById("movie-descripcion")
                .value.trim(),
            duracion: parseInt(document.getElementById("movie-duracion").value),
            fechaEstreno: document.getElementById("movie-fecha-estreno").value,
            idClasificacion: parseInt(
                document.getElementById("movie-clasificacion").value
            ),
            idTipoPublico: parseInt(
                document.getElementById("movie-tipo-publico").value
            ),
        };

        const validation = validateForm(formData, {
            nombre: { required: true, label: "Nombre" },
            descripcion: { required: true, label: "Descripción" },
            duracion: {
                required: true,
                type: "number",
                min: 1,
                label: "Duración",
            },
            fechaEstreno: { required: true, label: "Fecha de Estreno" },
            idClasificacion: {
                required: true,
                type: "number",
                label: "Clasificación",
            },
            idTipoPublico: {
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
        const [classifications, audienceTypes] = await Promise.all([
            api.getClassifications(),
            api.getAudienceTypes(),
        ]);

        const clasificacionSelect = document.getElementById(
            "movie-clasificacion"
        );
        const tipoPublicoSelect = document.getElementById("movie-tipo-publico");

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

        if (movieId) {
            const movie = await api.getMovie(movieId);
            document.getElementById("movie-modal-title").textContent =
                "Editar Película";
            document.getElementById("movie-id").value = movieId;
            document.getElementById("movie-nombre").value = movie.nombre || "";
            document.getElementById("movie-descripcion").value =
                movie.descripcion || "";
            document.getElementById("movie-duracion").value =
                movie.duracion || "";
            document.getElementById("movie-fecha-estreno").value =
                movie.fechaEstreno
                    ? new Date(movie.fechaEstreno).toISOString().split("T")[0]
                    : "";
            clasificacionSelect.value = movie.idClasificacion || "";
            tipoPublicoSelect.value = movie.idTipoPublico || "";
        } else {
            document.getElementById("movie-modal-title").textContent =
                "Agregar Película";
            document.getElementById("movie-form").reset();
            document.getElementById("movie-id").value = "";
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

