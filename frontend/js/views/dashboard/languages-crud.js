// Languages CRUD for Dashboard
async function loadLanguagesCRUD() {
    const container = document.getElementById("actors-table-container");
    if (!container) return;

    // Update title and button
    const title = document.querySelector("main h1");
    const btn = document.querySelector("main button");
    if (title) title.textContent = "Gestión de Idiomas";
    if (btn) {
        btn.textContent = "+ Agregar Idioma";
        btn.setAttribute("onclick", "showLanguageModal()");
    }

    try {
        const languages = await api.getLanguages();
        container.innerHTML = `
            <table class="w-full">
                <thead class="bg-gray-800">
                    <tr>
                        <th class="px-6 py-3 text-left">ID</th>
                        <th class="px-6 py-3 text-left">Nombre</th>
                        <th class="px-6 py-3 text-left">Subtitulado</th>
                        <th class="px-6 py-3 text-left">Doblado</th>
                        <th class="px-6 py-3 text-left">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${languages
                        .map(
                            (lang) => `
                        <tr class="border-t border-gray-700 hover:bg-gray-800">
                            <td class="px-6 py-4">${lang.idIdioma}</td>
                            <td class="px-6 py-4">${sanitizeInput(
                                lang.nombre
                            )}</td>
                            <td class="px-6 py-4">${
                                lang.subtitulado ? "Sí" : "No"
                            }</td>
                            <td class="px-6 py-4">${
                                lang.doblado ? "Sí" : "No"
                            }</td>
                            <td class="px-6 py-4">
                                <button onclick="editLanguage(${
                                    lang.idIdioma
                                })" class="text-blue-400 hover:text-blue-300 mr-4">Editar</button>
                                <button onclick="deleteLanguage(${
                                    lang.idIdioma
                                })" class="text-red-400 hover:text-red-300">Eliminar</button>
                            </td>
                        </tr>
                    `
                        )
                        .join("")}
                </tbody>
            </table>
        `;
    } catch (error) {
        container.innerHTML = `<div class="p-4 text-red-400">Error al cargar idiomas: ${error.message}</div>`;
    }
}

window.editLanguage = function (id) {
    showIdiomaModal(id);
};

window.deleteLanguage = async function (id) {
    if (confirm("¿Estás seguro de eliminar este idioma?")) {
        try {
            await api.deleteLanguage(id);
            showNotification("Idioma eliminado", "success");
            loadLanguagesCRUD();
        } catch (error) {
            showNotification("Error al eliminar idioma", "error");
        }
    }
};

// La función showIdiomaModal ya está definida globalmente en idioma-modal.js
// No necesitamos redefinirla aquí, solo usarla directamente

