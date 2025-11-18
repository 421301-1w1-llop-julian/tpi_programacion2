// Funcion Modal Functions
function initFuncionModal() {
    const form = document.getElementById("funcion-form");
    if (!form) return;

    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);

    newForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const errorDiv = document.getElementById("funcion-form-error");
        errorDiv.classList.add("hidden");

        const funcionId = document.getElementById("funcion-id").value;
        
        // Obtener fecha y hora
        const fechaHoraValue = document.getElementById("funcion-fecha-hora").value;
        const fechaHora = fechaHoraValue ? new Date(fechaHoraValue).toISOString() : null;
        
        const formData = {
            IdPelicula: parseInt(document.getElementById("funcion-pelicula").value),
            IdSala: parseInt(document.getElementById("funcion-sala").value),
            FechaHoraInicio: fechaHora,
            PrecioBase: parseFloat(document.getElementById("funcion-precio").value),
        };

        const validation = validateForm(formData, {
            IdPelicula: { required: true, type: "number", label: "Película" },
            IdSala: { required: true, type: "number", label: "Sala" },
            FechaHoraInicio: { required: true, label: "Fecha y Hora" },
            PrecioBase: { required: true, type: "decimal", min: 0, label: "Precio Base" },
        });

        if (!validation.isValid) {
            errorDiv.textContent = Object.values(validation.errors)[0];
            errorDiv.classList.remove("hidden");
            return;
        }

        try {
            if (funcionId) {
                // Para actualizar, necesitamos incluir IdFuncion
                formData.IdFuncion = parseInt(funcionId);
                console.log("Updating funcion with ID:", funcionId, "Data:", formData);
                await api.updateFunction(funcionId, formData);
                showNotification("Función actualizada exitosamente", "success");
            } else {
                console.log("Creating new funcion with data:", formData);
                await api.createFunction(formData);
                showNotification("Función creada exitosamente", "success");
            }
            closeFuncionModal();
            // Recargar la lista de funciones
            if (typeof loadFunctionsCRUD === "function") {
                loadFunctionsCRUD();
            } else if (window.loadFunctionsCRUD) {
                window.loadFunctionsCRUD();
            }
        } catch (error) {
            console.error("Error saving funcion:", error);
            const errorMessage = error.message || "Error al guardar la función";
            errorDiv.textContent = errorMessage;
            errorDiv.classList.remove("hidden");
            showNotification(errorMessage, "error");
        }
    });
}

// Global functions for funciones
window.showFuncionModal = async function (funcionId = null) {
    // Load modal only when needed (lazy loading)
    if (!document.getElementById("funcion-modal")) {
        await loadModal("funcion-modal.html");
    }
    const modal = document.getElementById("funcion-modal");
    if (!modal) return;

    try {
        // Load películas and salas for selects
        const [peliculas, salas] = await Promise.all([
            api.getMovies(),
            api.getSalas ? api.getSalas() : Promise.resolve([])
        ]);

        // Películas
        const peliculaSelect = document.getElementById("funcion-pelicula");
        if (peliculaSelect) {
            peliculaSelect.innerHTML =
                '<option value="">Seleccionar...</option>' +
                peliculas
                    .map(
                        (p) => {
                            const id = p.idPelicula || p.IdPelicula;
                            const nombre = p.nombre || p.Nombre || "";
                            return `<option value="${id}">${sanitizeInput(nombre)}</option>`;
                        }
                    )
                    .join("");
        }

        // Salas
        const salaSelect = document.getElementById("funcion-sala");
        if (salaSelect) {
            if (salas && salas.length > 0) {
                salaSelect.innerHTML =
                    '<option value="">Seleccionar...</option>' +
                    salas
                        .map(
                            (s) => {
                                const id = s.idSala || s.IdSala;
                                const numero = s.numeroSala || s.NumeroSala || "";
                                return `<option value="${id}">Sala ${numero}</option>`;
                            }
                        )
                        .join("");
            } else {
                // Si no hay endpoint de salas, mostrar mensaje
                salaSelect.innerHTML = '<option value="">No hay salas disponibles</option>';
                console.warn("No se encontró endpoint para obtener salas");
            }
        }

        if (funcionId) {
            const funcion = await api.getFunction(funcionId);
            console.log("Funcion data received:", funcion); // Debug
            document.getElementById("funcion-modal-title").textContent =
                "Editar Función";
            document.getElementById("funcion-id").value = funcionId;
            
            const idPelicula = funcion.idPelicula || funcion.IdPelicula;
            const idSala = funcion.idSala || funcion.IdSala;
            const fechaHora = funcion.fechaHoraInicio || funcion.FechaHoraInicio;
            const precioBase = funcion.precioBase || funcion.PrecioBase;
            
            if (peliculaSelect) peliculaSelect.value = idPelicula || "";
            if (salaSelect) salaSelect.value = idSala || "";
            
            // Formatear fecha y hora para datetime-local
            if (fechaHora) {
                const fecha = new Date(fechaHora);
                const fechaLocal = new Date(fecha.getTime() - fecha.getTimezoneOffset() * 60000)
                    .toISOString()
                    .slice(0, 16);
                document.getElementById("funcion-fecha-hora").value = fechaLocal;
            }
            
            document.getElementById("funcion-precio").value = precioBase || "";
        } else {
            document.getElementById("funcion-modal-title").textContent =
                "Agregar Función";
            document.getElementById("funcion-form").reset();
            document.getElementById("funcion-id").value = "";
        }
    } catch (error) {
        console.error("Error loading modal data:", error);
    }

    modal.classList.remove("hidden");
};

window.closeFuncionModal = function () {
    const modal = document.getElementById("funcion-modal");
    if (modal) {
        modal.classList.add("hidden");
        document.getElementById("funcion-form")?.reset();
    }
};

