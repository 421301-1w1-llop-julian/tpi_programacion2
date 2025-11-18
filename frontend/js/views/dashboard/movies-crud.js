// Movies CRUD for Dashboard
let allMovies = [];
let currentMoviesPage = 1;
const moviesPageSize = 10;

async function loadMoviesCRUD(pagina = 1) {
    const container = document.getElementById("movies-table-container");
    if (!container) return;

    try {
        // Solo cargar datos si no los tenemos o si se recargó
        if (allMovies.length === 0 || pagina === 1) {
            allMovies = await api.getMovies();
        }
        
        currentMoviesPage = pagina;
        const paginacion = paginateData(allMovies, pagina, moviesPageSize);
        const movies = paginacion.datos;

        container.innerHTML = `
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-gray-800">
                        <tr>
                            <th class="px-6 py-3 text-left">ID</th>
                            <th class="px-6 py-3 text-left">Nombre</th>
                            <th class="px-6 py-3 text-left">Duración</th>
                            <th class="px-6 py-3 text-left">Fecha Estreno</th>
                            <th class="px-6 py-3 text-left">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${movies.length > 0 ? movies
                            .map(
                                (movie) => `
                            <tr class="border-t border-gray-700 hover:bg-gray-800">
                                <td class="px-6 py-4">${movie.idPelicula}</td>
                                <td class="px-6 py-4">${sanitizeInput(
                                    movie.nombre
                                )}</td>
                                <td class="px-6 py-4">${formatDuration(
                                    movie.duracion
                                )}</td>
                                <td class="px-6 py-4">${formatDate(
                                    movie.fechaEstreno
                                )}</td>
                                <td class="px-6 py-4">
                                    <button onclick="editMovie(${
                                        movie.idPelicula
                                    })" class="text-blue-400 hover:text-blue-300 mr-4">Editar</button>
                                    <button onclick="deleteMovie(${
                                        movie.idPelicula
                                    })" class="text-red-400 hover:text-red-300">Eliminar</button>
                                </td>
                            </tr>
                        `
                            )
                            .join("") : '<tr><td colspan="5" class="px-6 py-4 text-center text-gray-400">No hay películas disponibles</td></tr>'}
                    </tbody>
                </table>
            </div>
            ${renderPagination(paginacion.paginaActual, paginacion.totalPaginas, paginacion.totalRegistros, "changeMoviesPage")}
        `;
    } catch (error) {
        container.innerHTML = `<div class="p-4 text-red-400">Error al cargar películas: ${error.message}</div>`;
    }
}

window.changeMoviesPage = function(pagina) {
    loadMoviesCRUD(pagina);
};

window.editMovie = function (movieId) {
    showMovieModal(movieId);
};

window.deleteMovie = async function (movieId) {
    if (confirm("¿Estás seguro de eliminar esta película?")) {
        try {
            await api.deleteMovie(movieId);
            showNotification("Película eliminada", "success");
            // Recargar datos y mantener la página actual
            allMovies = [];
            loadMoviesCRUD(currentMoviesPage);
        } catch (error) {
            showNotification("Error al eliminar película", "error");
        }
    }
};

