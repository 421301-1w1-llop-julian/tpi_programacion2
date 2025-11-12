// Products CRUD for Dashboard
async function loadProductsCRUD() {
    const container = document.getElementById("products-table-container");
    if (!container) return;

    try {
        const products = await api.getProducts();
        container.innerHTML = `
            <table class="w-full">
                <thead class="bg-gray-800">
                    <tr>
                        <th class="px-6 py-3 text-left">ID</th>
                        <th class="px-6 py-3 text-left">Nombre</th>
                        <th class="px-6 py-3 text-left">Precio</th>
                        <th class="px-6 py-3 text-left">Tipo</th>
                        <th class="px-6 py-3 text-left">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${products
                        .map(
                            (product) => `
                        <tr class="border-t border-gray-700 hover:bg-gray-800">
                            <td class="px-6 py-4">${product.idProducto}</td>
                            <td class="px-6 py-4">${sanitizeInput(
                                product.nombre
                            )}</td>
                            <td class="px-6 py-4">${formatCurrency(
                                product.precio
                            )}</td>
                            <td class="px-6 py-4">${
                                product.idTipoProductoNavigation?.nombre ||
                                "N/A"
                            }</td>
                            <td class="px-6 py-4">
                                <button onclick="editProduct(${
                                    product.idProducto
                                })" class="text-blue-400 hover:text-blue-300 mr-4">Editar</button>
                                <button onclick="deleteProduct(${
                                    product.idProducto
                                })" class="text-red-400 hover:text-red-300">Eliminar</button>
                            </td>
                        </tr>
                    `
                        )
                        .join("")}
                </tbody>
            </table>
        `;
        await loadModal("product-modal.html");
    } catch (error) {
        container.innerHTML = `<div class="p-4 text-red-400">Error al cargar productos: ${error.message}</div>`;
    }
}

window.editProduct = function (productId) {
    showProductModal(productId);
};

window.deleteProduct = async function (productId) {
    if (confirm("¿Estás seguro de eliminar este producto?")) {
        try {
            await api.deleteProduct(productId);
            showNotification("Producto eliminado", "success");
            loadProductsCRUD();
        } catch (error) {
            showNotification("Error al eliminar producto", "error");
        }
    }
};

