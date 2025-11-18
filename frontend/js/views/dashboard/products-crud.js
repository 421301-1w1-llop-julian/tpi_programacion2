// Products CRUD for Dashboard
let allProducts = [];
let currentProductsPage = 1;
const productsPageSize = 10;

async function loadProductsCRUD(pagina = 1) {
    const container = document.getElementById("products-table-container");
    if (!container) return;

    try {
        if (allProducts.length === 0 || pagina === 1) {
            allProducts = await api.getProducts();
        }
        
        currentProductsPage = pagina;
        const paginacion = paginateData(allProducts, pagina, productsPageSize);
        const products = paginacion.datos;

        container.innerHTML = `
            <div class="overflow-x-auto">
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
                        ${products.length > 0 ? products
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
                            .join("") : '<tr><td colspan="5" class="px-6 py-4 text-center text-gray-400">No hay productos disponibles</td></tr>'}
                    </tbody>
                </table>
            </div>
            ${renderPagination(paginacion.paginaActual, paginacion.totalPaginas, paginacion.totalRegistros, "changeProductsPage")}
        `;
    } catch (error) {
        container.innerHTML = `<div class="p-4 text-red-400">Error al cargar productos: ${error.message}</div>`;
    }
}

window.changeProductsPage = function(pagina) {
    loadProductsCRUD(pagina);
};

window.editProduct = function (productId) {
    showProductModal(productId);
};

window.deleteProduct = async function (productId) {
    if (confirm("¿Estás seguro de eliminar este producto?")) {
        try {
            await api.deleteProduct(productId);
            showNotification("Producto eliminado", "success");
            allProducts = [];
            loadProductsCRUD(currentProductsPage);
        } catch (error) {
            showNotification("Error al eliminar producto", "error");
        }
    }
};
