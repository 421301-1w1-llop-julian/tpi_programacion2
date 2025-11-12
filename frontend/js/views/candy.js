// Candy View Handler
async function candyViewHandler() {
    const grid = document.getElementById("products-grid");
    if (!grid) return;

    try {
        const products = await api.getProducts();
        if (products.length === 0) {
            grid.innerHTML =
                '<div class="col-span-full text-center py-12 text-gray-400">No hay productos disponibles</div>';
            return;
        }

        grid.innerHTML = products
            .map(
                (product) => `
            <div class="bg-cine-gray rounded-lg overflow-hidden hover:transform hover:scale-105 transition">
                <div class="w-full h-48 bg-gray-700 flex items-center justify-center cursor-pointer"
                     onclick="router.navigate('/candy/${product.idProducto}')">
                    <span class="text-gray-400">Imagen</span>
                </div>
                <div class="p-4">
                    <h3 class="text-lg font-bold mb-2 cursor-pointer"
                        onclick="router.navigate('/candy/${
                            product.idProducto
                        }')">
                        ${sanitizeInput(product.nombre || "Sin nombre")}
                    </h3>
                    <div class="flex items-center justify-between">
                        <span class="text-xl font-bold text-cine-red">${formatCurrency(
                            product.precio || 0
                        )}</span>
                        <button onclick="addToCart(${product.idProducto})" 
                                class="bg-cine-red w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-700 transition">
                            <span class="text-white font-bold">+</span>
                        </button>
                    </div>
                </div>
            </div>
        `
            )
            .join("");
    } catch (error) {
        grid.innerHTML =
            '<div class="col-span-full text-center py-12 text-red-400">Error al cargar productos</div>';
    }
}

