// Actors CRUD for Dashboard
let allActors = [];
let currentActorsPage = 1;
const actorsPageSize = 10;

async function loadActorsCRUD(pagina = 1) {
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
        if (allActors.length === 0 || pagina === 1) {
            allActors = await api.getActors();
        }
        
        currentActorsPage = pagina;
        const paginacion = paginateData(allActors, pagina, actorsPageSize);
        const actors = paginacion.datos;

        container.innerHTML = `
            <div class="overflow-x-auto">
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
                        ${actors.length > 0 ? actors
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
                                    actor.paisNombre || "N/A"
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
                            .join("") : '<tr><td colspan="5" class="px-6 py-4 text-center text-gray-400">No hay actores disponibles</td></tr>'}
                    </tbody>
                </table>
            </div>
            ${renderPagination(paginacion.paginaActual, paginacion.totalPaginas, paginacion.totalRegistros, "changeActorsPage")}
        `;
    } catch (error) {
        container.innerHTML = `<div class="p-4 text-red-400">Error al cargar actores: ${error.message}</div>`;
    }
}

window.changeActorsPage = function(pagina) {
    loadActorsCRUD(pagina);
};

window.editActor = function (actorId) {
    showActorModal(actorId);
};

window.deleteActor = async function (actorId) {
    if (confirm("¿Estás seguro de eliminar este actor?")) {
        try {
            await api.deleteActor(actorId);
            showNotification("Actor eliminado", "success");
            allActors = [];
            loadActorsCRUD(currentActorsPage);
        } catch (error) {
            showNotification("Error al eliminar actor", "error");
        }
    }
};
