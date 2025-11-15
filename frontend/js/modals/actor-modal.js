// Actor Modal Functions
function initActorModal() {
    const form = document.getElementById("actor-form");
    if (!form) return;

    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);

    newForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const errorDiv = document.getElementById("actor-form-error");
        errorDiv.classList.add("hidden");

        const actorId = document.getElementById("actor-id").value;
        const formData = {
            Nombre: document.getElementById("actor-nombre").value.trim(),
            Apellido: document.getElementById("actor-apellido").value.trim(),
            IdPais: parseInt(document.getElementById("actor-pais").value),
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
            if (actorId) {
                console.log("Updating actor with ID:", actorId, "Data:", formData);
                await api.updateActor(actorId, formData);
                showNotification("Actor actualizado exitosamente", "success");
            } else {
                console.log("Creating new actor with data:", formData);
                await api.createActor(formData);
                showNotification("Actor creado exitosamente", "success");
            }
            closeActorModal();
            // Recargar la lista de actores
            if (typeof loadActorsCRUD === "function") {
                loadActorsCRUD();
            } else if (window.loadActorsCRUD) {
                window.loadActorsCRUD();
            }
        } catch (error) {
            console.error("Error saving actor:", error);
            const errorMessage = error.message || "Error al guardar el actor";
            errorDiv.textContent = errorMessage;
            errorDiv.classList.remove("hidden");
            showNotification(errorMessage, "error");
        }
    });
}

// Global functions for actors
window.showActorModal = async function (actorId = null) {
    // Load modal only when needed (lazy loading)
    if (!document.getElementById("actor-modal")) {
        await loadModal("actor-modal.html");
    }
    const modal = document.getElementById("actor-modal");
    if (!modal) return;

    try {
        // Load countries for select
        const countries = await api.getCountries();
        const paisSelect = document.getElementById("actor-pais");
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

        if (actorId) {
            const actor = await api.getActor(actorId);
            console.log("Actor data received:", actor); // Debug
            document.getElementById("actor-modal-title").textContent =
                "Editar Actor";
            document.getElementById("actor-id").value = actorId;
            document.getElementById("actor-nombre").value = actor?.nombre || actor?.Nombre || "";
            document.getElementById("actor-apellido").value =
                actor?.apellido || actor?.Apellido || "";
            const idPais = actor?.idPais || actor?.IdPais;
            if (paisSelect) paisSelect.value = idPais || "";
        } else {
            document.getElementById("actor-modal-title").textContent =
                "Agregar Actor";
            document.getElementById("actor-form").reset();
            document.getElementById("actor-id").value = "";
        }
    } catch (error) {
        console.error("Error loading modal data:", error);
    }

    modal.classList.remove("hidden");
};

window.closeActorModal = function () {
    const modal = document.getElementById("actor-modal");
    if (modal) {
        modal.classList.add("hidden");
        document.getElementById("actor-form")?.reset();
    }
};

