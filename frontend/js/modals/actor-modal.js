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
            nombre: document.getElementById("actor-nombre").value.trim(),
            apellido: document.getElementById("actor-apellido").value.trim(),
            idPais: parseInt(document.getElementById("actor-pais").value),
        };

        const validation = validateForm(formData, {
            nombre: { required: true, label: "Nombre" },
            apellido: { required: true, label: "Apellido" },
            idPais: { required: true, type: "number", label: "País" },
        });

        if (!validation.isValid) {
            errorDiv.textContent = Object.values(validation.errors)[0];
            errorDiv.classList.remove("hidden");
            return;
        }

        try {
            if (actorId) {
                await api.updateActor(actorId, formData);
                showNotification("Actor actualizado exitosamente", "success");
            } else {
                await api.createActor(formData);
                showNotification("Actor creado exitosamente", "success");
            }
            closeActorModal();
            loadActorsCRUD();
        } catch (error) {
            errorDiv.textContent = error.message;
            errorDiv.classList.remove("hidden");
        }
    });
}

// Global functions for actors
window.showActorModal = async function (actorId = null) {
    await loadModal("actor-modal.html");
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
                        (c) =>
                            `<option value="${c.idPais}">${sanitizeInput(
                                c.nombre
                            )}</option>`
                    )
                    .join("");
        }

        if (actorId) {
            const actor = await api.getActor(actorId);
            document.getElementById("actor-modal-title").textContent =
                "Editar Actor";
            document.getElementById("actor-id").value = actorId;
            document.getElementById("actor-nombre").value = actor?.nombre || "";
            document.getElementById("actor-apellido").value =
                actor?.apellido || "";
            if (paisSelect) paisSelect.value = actor?.idPais || "";
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

