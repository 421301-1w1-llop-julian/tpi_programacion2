// Global Utility Functions

window.addToCart = function (productId) {
    cart.addProduct(productId, 1);
    showNotification("Producto agregado al carrito", "success");
};

window.applyAnalyticsFilters = async function () {
    const filters = {
        fechaInicio: document.getElementById("filter-date-start")?.value,
        fechaFin: document.getElementById("filter-date-end")?.value,
        montoMinimo: document.getElementById("filter-amount-min")?.value,
        montoMaximo: document.getElementById("filter-amount-max")?.value,
    };

    try {
        const analytics = await api.getAnalytics(filters);
        showNotification("Filtros aplicados", "success");
        dashboardViewHandler();
    } catch (error) {
        showNotification("Error al aplicar filtros", "error");
    }
};

