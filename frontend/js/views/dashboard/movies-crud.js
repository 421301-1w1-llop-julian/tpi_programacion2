// Movies CRUD for Dashboard
async function loadMoviesCRUD() {
    const container = document.getElementById("movies-table-container");
    if (!container) return;

    try {
        const movies = await api.getMovies();
        container.innerHTML = `
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
                    ${movies
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
                        .join("")}
                </tbody>
            </table>
        `;

        // Load modal
        await loadModal("movie-modal.html");
    } catch (error) {
        container.innerHTML = `<div class="p-4 text-red-400">Error al cargar películas: ${error.message}</div>`;
    }
}

window.editMovie = function (movieId) {
    showMovieModal(movieId);
};

window.deleteMovie = async function (movieId) {
    if (confirm("¿Estás seguro de eliminar esta película?")) {
        try {
            await api.deleteMovie(movieId);
            showNotification("Película eliminada", "success");
            loadMoviesCRUD();
        } catch (error) {
            showNotification("Error al eliminar película", "error");
        }
    }
};

