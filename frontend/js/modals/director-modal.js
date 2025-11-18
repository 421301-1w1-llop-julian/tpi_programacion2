// Director Modal Functions
function initDirectorModal() {
    const form = document.getElementById("director-form");
    if (!form) return;

    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);

    newForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const errorDiv = document.getElementById("director-form-error");
        errorDiv.classList.add("hidden");

        const directorId = document.getElementById("director-id").value;
        const formData = {
            Nombre: document.getElementById("director-nombre").value.trim(),
            Apellido: document.getElementById("director-apellido").value.trim(),
            IdPais: parseInt(document.getElementById("director-pais").value),
        };

        const validation = validateForm(formData, {
            Nombre: { required: true, label: "Nombre" },
            Apellido: { required: true, label: "Apellido" },
            IdPais: { required: true, type: "number", label: "País" },
        });

        if (!validation.isValid) {
            errorDiv.textContent = Object.values(validation.errors)[0];
            errorDiv.classList.remove("hidden");
            return;
        }

        try {
            if (directorId) {
                console.log("Updating director with ID:", directorId, "Data:", formData);
                await api.updateDirector(directorId, formData);
                showNotification("Director actualizado exitosamente", "success");
            } else {
                console.log("Creating new director with data:", formData);
                await api.createDirector(formData);
                showNotification("Director creado exitosamente", "success");
            }
            closeDirectorModal();
            // Recargar la lista de directores
            if (typeof loadDirectorsCRUD === "function") {
                loadDirectorsCRUD();
            } else if (window.loadDirectorsCRUD) {
                window.loadDirectorsCRUD();
            }
        } catch (error) {
            console.error("Error saving director:", error);
            const errorMessage = error.message || "Error al guardar el director";
            errorDiv.textContent = errorMessage;
            errorDiv.classList.remove("hidden");
            showNotification(errorMessage, "error");
        }
    });
}

// Global functions for directors
window.showDirectorModal = async function (directorId = null) {
    // Load modal only when needed (lazy loading)
    if (!document.getElementById("director-modal")) {
        await loadModal("director-modal.html");
    }
    const modal = document.getElementById("director-modal");
    if (!modal) return;

    try {
        // Load countries for select
        const countries = await api.getCountries();
        const paisSelect = document.getElementById("director-pais");
        if (paisSelect) {
            paisSelect.innerHTML =
                '<option value="">Seleccionar...</option>' +
                countries
                    .map(
                        (c) => {
                            const id = c.idPais || c.IdPais;
                            const nombre = c.nombre || c.Nombre || "";
                            return `<option value="${id}">${sanitizeInput(nombre)}</option>`;
                        }
                    )
                    .join("");
        }

        if (directorId) {
            const director = await api.getDirector(directorId);
            console.log("Director data received:", director); // Debug
            document.getElementById("director-modal-title").textContent =
                "Editar Director";
            document.getElementById("director-id").value = directorId;
            document.getElementById("director-nombre").value = director?.nombre || director?.Nombre || "";
            document.getElementById("director-apellido").value =
                director?.apellido || director?.Apellido || "";
            const idPais = director?.idPais || director?.IdPais;
            if (paisSelect) paisSelect.value = idPais || "";
        } else {
            document.getElementById("director-modal-title").textContent =
                "Agregar Director";
            document.getElementById("director-form").reset();
            document.getElementById("director-id").value = "";
        }
    } catch (error) {
        console.error("Error loading modal data:", error);
    }

    modal.classList.remove("hidden");
};

window.closeDirectorModal = function () {
    const modal = document.getElementById("director-modal");
    if (modal) {
        modal.classList.add("hidden");
        document.getElementById("director-form")?.reset();
    }
};

