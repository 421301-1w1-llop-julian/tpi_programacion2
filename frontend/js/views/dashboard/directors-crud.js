// Directors CRUD for Dashboard
async function loadDirectorsCRUD() {
    const container = document.getElementById("actors-table-container");
    if (!container) return;

    // Update title and button
    const title = document.querySelector("main h1");
    const btn = document.querySelector("main button");
    if (title) title.textContent = "Gestión de Directores";
    if (btn) {
        btn.textContent = "+ Agregar Director";
        btn.setAttribute("onclick", "showDirectorModal()");
    }

    try {
        const directors = await api.getDirectors();
        container.innerHTML = `
            <table class="w-full">
                <thead class="bg-gray-800">
                    <tr>
                        <th class="px-6 py-3 text-left">ID</th>
                        <th class="px-6 py-3 text-left">Nombre</th>
                        <th class="px-6 py-3 text-left">Apellido</th>
                        <th class="px-6 py-3 text-left">País</th>
                        <th class="px-6 py-3 text-left">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${directors
                        .map(
                            (director) => `
                        <tr class="border-t border-gray-700 hover:bg-gray-800">
                            <td class="px-6 py-4">${director.idDirector}</td>
                            <td class="px-6 py-4">${sanitizeInput(
                                director.nombre
                            )}</td>
                            <td class="px-6 py-4">${sanitizeInput(
                                director.apellido
                            )}</td>
                            <td class="px-6 py-4">${
                                director.paisNombre || "N/A"
                            }</td>
                            <td class="px-6 py-4">
                                <button onclick="editDirector(${
                                    director.idDirector
                                })" class="text-blue-400 hover:text-blue-300 mr-4">Editar</button>
                                <button onclick="deleteDirector(${
                                    director.idDirector
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
        container.innerHTML = `<div class="p-4 text-red-400">Error al cargar directores: ${error.message}</div>`;
    }
}

window.editDirector = function (id) {
    showNotification("Funcionalidad en desarrollo", "info");
};

window.deleteDirector = async function (id) {
    if (confirm("¿Estás seguro de eliminar este director?")) {
        try {
            await api.deleteDirector(id);
            showNotification("Director eliminado", "success");
            loadDirectorsCRUD();
        } catch (error) {
            showNotification("Error al eliminar director", "error");
        }
    }
};

window.showDirectorModal = function () {
    showNotification("Modal de director en desarrollo", "info");
};
