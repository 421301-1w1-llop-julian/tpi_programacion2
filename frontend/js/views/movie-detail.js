// Movie Detail Handler
async function movieDetailViewHandler(params) {
    const movieId = params.id;
    const content = document.getElementById("movie-detail-content");
    if (!content) return;

    try {
        const movie = await api.getMovie(movieId);
        content.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="w-full h-auto bg-gray-700 rounded flex items-center justify-center">
                     <img src=${movie.imagen} alt="${sanitizeInput(
            movie.nombre
        )}" class="w-full object-cover rounded"/>
                </div>
                <div>
                    <h1 class="text-4xl font-bold mb-4">${sanitizeInput(
                        movie.nombre || "Sin título"
                    )}</h1>
                    <p class="text-gray-300 mb-6">${sanitizeInput(
                        movie.descripcion || "Sin descripción"
                    )}</p>
                    <div class="space-y-2 mb-6">
                        <div><span class="font-semibold">Duración:</span> ${formatDuration(
                            movie.duracion || 0
                        )}</div>
                        <div><span class="font-semibold">Fecha de Estreno:</span> ${formatDate(
                            movie.fechaEstreno
                        )}</div>
                        <div><span class="font-semibold">Clasificación:</span> ${
                            movie.idClasificacionNavigation?.nombre || "N/A"
                        }</div>
                        <div><span class="font-semibold">Tipo de Público:</span> ${
                            movie.idTipoPublicoNavigation?.nombre || "N/A"
                        }</div>
                    </div>
                    <a href="#/comprar?pelicula=${
                        movie.idPelicula
                    }" class="inline-block bg-cine-red px-6 py-3 rounded hover:bg-red-700 transition font-bold">
                        Comprar Entradas
                    </a>
                </div>
            </div>
        `;
    } catch (error) {
        content.innerHTML = `
            <div class="bg-red-900 bg-opacity-50 border border-red-500 rounded p-4">
                <p>Error al cargar la película: ${error.message}</p>
            </div>
        `;
    }
}

