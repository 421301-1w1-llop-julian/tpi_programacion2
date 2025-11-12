// Candy Detail Handler
async function candyDetailViewHandler(params) {
    const productId = params.id;
    const content = document.getElementById("product-detail-content");
    if (!content) return;

    try {
        const product = await api.getProduct(productId);
        content.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="w-full h-96 bg-gray-700 rounded flex items-center justify-center">
                    <span class="text-gray-400">Imagen del Producto</span>
                </div>
                <div>
                    <h1 class="text-4xl font-bold mb-4">${sanitizeInput(
                        product.nombre || "Sin nombre"
                    )}</h1>
                    <p class="text-gray-300 mb-6 text-xl">${formatCurrency(
                        product.precio || 0
                    )}</p>
                    <p class="text-gray-300 mb-6">${sanitizeInput(
                        product.descripcion || "Sin descripción"
                    )}</p>
                    <button onclick="addToCart(${product.idProducto})" 
                            class="bg-cine-red px-6 py-3 rounded hover:bg-red-700 transition font-bold">
                        Agregar al Carrito
                    </button>
                </div>
            </div>
        `;
    } catch (error) {
        content.innerHTML = `
            <div class="bg-red-900 bg-opacity-50 border border-red-500 rounded p-4">
                <p>Error al cargar el producto: ${error.message}</p>
            </div>
        `;
    }
}

