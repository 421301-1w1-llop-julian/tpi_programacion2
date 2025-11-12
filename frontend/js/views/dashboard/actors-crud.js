// Actors CRUD for Dashboard
async function loadActorsCRUD() {
    const container = document.getElementById("actors-table-container");
    if (!container) return;

    // Update title and button
    const title = document.querySelector("main h1");
    const btn = document.querySelector("main button");
    if (title) title.textContent = "Gestión de Actores";
    if (btn) {
        btn.textContent = "+ Agregar Actor";
        btn.setAttribute("onclick", "showActorModal()");
    }

    try {
        const actors = await api.getActors();
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
                    ${actors
                        .map(
                            (actor) => `
                        <tr class="border-t border-gray-700 hover:bg-gray-800">
                            <td class="px-6 py-4">${actor.idActor}</td>
                            <td class="px-6 py-4">${sanitizeInput(
                                actor.nombre
                            )}</td>
                            <td class="px-6 py-4">${sanitizeInput(
                                actor.apellido
                            )}</td>
                            <td class="px-6 py-4">${
                                actor.idPaisNavigation?.nombre || "N/A"
                            }</td>
                            <td class="px-6 py-4">
                                <button onclick="editActor(${
                                    actor.idActor
                                })" class="text-blue-400 hover:text-blue-300 mr-4">Editar</button>
                                <button onclick="deleteActor(${
                                    actor.idActor
                                })" class="text-red-400 hover:text-red-300">Eliminar</button>
                            </td>
                        </tr>
                    `
                        )
                        .join("")}
                </tbody>
            </table>
        `;
        await loadModal("actor-modal.html");
    } catch (error) {
        container.innerHTML = `<div class="p-4 text-red-400">Error al cargar actores: ${error.message}</div>`;
    }
}

window.editActor = function (actorId) {
    showActorModal(actorId);
};

window.deleteActor = async function (actorId) {
    if (confirm("¿Estás seguro de eliminar este actor?")) {
        try {
            await api.deleteActor(actorId);
            showNotification("Actor eliminado", "success");
            loadActorsCRUD();
        } catch (error) {
            showNotification("Error al eliminar actor", "error");
        }
    }
};

