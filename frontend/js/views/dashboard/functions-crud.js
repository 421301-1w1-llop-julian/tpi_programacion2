// Functions CRUD for Dashboard
let allFunctions = [];
let currentFunctionsPage = 1;
const functionsPageSize = 10;

async function loadFunctionsCRUD(pagina = 1) {
    const container = document.getElementById("actors-table-container");
    if (!container) return;

    // Update title and button
    const title = document.querySelector("main h1");
    const btn = document.querySelector("main button");
    if (title) title.textContent = "Gestión de Funciones";
    if (btn) {
        btn.textContent = "+ Agregar Función";
        btn.setAttribute("onclick", "showFuncionModal()");
    }

    try {
        if (allFunctions.length === 0 || pagina === 1) {
            allFunctions = await api.getFunctions();
        }
        
        currentFunctionsPage = pagina;
        const paginacion = paginateData(allFunctions, pagina, functionsPageSize);
        const functions = paginacion.datos;

        container.innerHTML = `
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-gray-800">
                        <tr>
                            <th class="px-6 py-3 text-left">ID</th>
                            <th class="px-6 py-3 text-left">Película</th>
                            <th class="px-6 py-3 text-left">Fecha/Hora</th>
                            <th class="px-6 py-3 text-left">Precio</th>
                            <th class="px-6 py-3 text-left">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${functions.length > 0 ? functions
                            .map(
                                (func) => `
                            <tr class="border-t border-gray-700 hover:bg-gray-800">
                                <td class="px-6 py-4">${func.idFuncion}</td>
                                <td class="px-6 py-4">${
                                    func.idPeliculaNavigation?.nombre || func.tituloPelicula || "N/A"
                                }</td>
                                <td class="px-6 py-4">${formatDateTime(
                                    func.fechaHoraInicio
                                )}</td>
                                <td class="px-6 py-4">${formatCurrency(
                                    func.precioBase
                                )}</td>
                                <td class="px-6 py-4">
                                    <button onclick="editFunction(${
                                        func.idFuncion
                                    })" class="text-blue-400 hover:text-blue-300 mr-4">Editar</button>
                                    <button onclick="deleteFunction(${
                                        func.idFuncion
                                    })" class="text-red-400 hover:text-red-300">Eliminar</button>
                                </td>
                            </tr>
                        `
                            )
                            .join("") : '<tr><td colspan="5" class="px-6 py-4 text-center text-gray-400">No hay funciones disponibles</td></tr>'}
                    </tbody>
                </table>
            </div>
            ${renderPagination(paginacion.paginaActual, paginacion.totalPaginas, paginacion.totalRegistros, "changeFunctionsPage")}
        `;
    } catch (error) {
        container.innerHTML = `<div class="p-4 text-red-400">Error al cargar funciones: ${error.message}</div>`;
    }
}

window.changeFunctionsPage = function(pagina) {
    loadFunctionsCRUD(pagina);
};

window.editFunction = function (id) {
    showFuncionModal(id);
};

window.deleteFunction = async function (id) {
    if (confirm("¿Estás seguro de eliminar esta función?")) {
        try {
            await api.deleteFunction(id);
            showNotification("Función eliminada", "success");
            allFunctions = [];
            loadFunctionsCRUD(currentFunctionsPage);
        } catch (error) {
            showNotification("Error al eliminar función", "error");
        }
    }
};

// La función showFuncionModal ya está definida globalmente en funcion-modal.js
// No necesitamos redefinirla aquí, solo usarla directamente

