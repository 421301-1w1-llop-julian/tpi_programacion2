// Idioma Modal Functions
function initIdiomaModal() {
    const form = document.getElementById("idioma-form");
    if (!form) return;

    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);

    newForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const errorDiv = document.getElementById("idioma-form-error");
        errorDiv.classList.add("hidden");

        const idiomaId = document.getElementById("idioma-id").value;
        const formData = {
            Nombre: document.getElementById("idioma-nombre").value.trim(),
            Subtitulado: document.getElementById("idioma-subtitulado").checked,
            Doblado: document.getElementById("idioma-doblado").checked,
        };

        const validation = validateForm(formData, {
            Nombre: { required: true, label: "Nombre" },
        });

        if (!validation.isValid) {
            errorDiv.textContent = Object.values(validation.errors)[0];
            errorDiv.classList.remove("hidden");
            return;
        }

        try {
            if (idiomaId) {
                console.log("Updating idioma with ID:", idiomaId, "Data:", formData);
                await api.updateLanguage(idiomaId, formData);
                showNotification("Idioma actualizado exitosamente", "success");
            } else {
                console.log("Creating new idioma with data:", formData);
                await api.createLanguage(formData);
                showNotification("Idioma creado exitosamente", "success");
            }
            closeIdiomaModal();
            // Recargar la lista de idiomas
            if (typeof loadLanguagesCRUD === "function") {
                loadLanguagesCRUD();
            } else if (window.loadLanguagesCRUD) {
                window.loadLanguagesCRUD();
            }
        } catch (error) {
            console.error("Error saving idioma:", error);
            const errorMessage = error.message || "Error al guardar el idioma";
            errorDiv.textContent = errorMessage;
            errorDiv.classList.remove("hidden");
            showNotification(errorMessage, "error");
        }
    });
}

// Global functions for idiomas
window.showIdiomaModal = async function (idiomaId = null) {
    // Load modal only when needed (lazy loading)
    if (!document.getElementById("idioma-modal")) {
        await loadModal("idioma-modal.html");
    }
    const modal = document.getElementById("idioma-modal");
    if (!modal) return;

    try {
        if (idiomaId) {
            const idioma = await api.getLanguage(idiomaId);
            console.log("Idioma data received:", idioma); // Debug
            document.getElementById("idioma-modal-title").textContent =
                "Editar Idioma";
            document.getElementById("idioma-id").value = idiomaId;
            document.getElementById("idioma-nombre").value = idioma?.nombre || idioma?.Nombre || "";
            document.getElementById("idioma-subtitulado").checked = idioma?.subtitulado || idioma?.Subtitulado || false;
            document.getElementById("idioma-doblado").checked = idioma?.doblado || idioma?.Doblado || false;
        } else {
            document.getElementById("idioma-modal-title").textContent =
                "Agregar Idioma";
            document.getElementById("idioma-form").reset();
            document.getElementById("idioma-id").value = "";
            document.getElementById("idioma-subtitulado").checked = false;
            document.getElementById("idioma-doblado").checked = false;
        }
    } catch (error) {
        console.error("Error loading modal data:", error);
    }

    modal.classList.remove("hidden");
};

window.closeIdiomaModal = function () {
    const modal = document.getElementById("idioma-modal");
    if (modal) {
        modal.classList.add("hidden");
        document.getElementById("idioma-form")?.reset();
    }
};

