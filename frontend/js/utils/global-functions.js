// Global Utility Functions

window.addToCart = function (productId) {
    cart.addProduct(productId, 1);
    showNotification("Producto agregado al carrito", "success");
};

window.applyAnalyticsFilters = async function () {
    const fechaInicio = document.getElementById("filter-date-start")?.value;
    const fechaFin = document.getElementById("filter-date-end")?.value;
    const montoMinimo = parseFloat(document.getElementById("filter-amount-min")?.value) || null;
    const montoMaximo = parseFloat(document.getElementById("filter-amount-max")?.value) || null;

    // Build backend filters
    const backendFilters = {};
    if (fechaInicio) backendFilters.fechaDesde = fechaInicio;
    if (fechaFin) backendFilters.fechaHasta = fechaFin;

    try {
        const [analytics, compras] = await Promise.all([
            api.getAnalytics(backendFilters),
            api.getCompras(backendFilters)
        ]);

        // Apply amount filters on frontend (since backend doesn't support it)
        let filteredCompras = compras || [];
        const hasAmountFilters = montoMinimo !== null || montoMaximo !== null;
        
        if (montoMinimo !== null) {
            filteredCompras = filteredCompras.filter(c => (c.total || 0) >= montoMinimo);
        }
        if (montoMaximo !== null) {
            filteredCompras = filteredCompras.filter(c => (c.total || 0) <= montoMaximo);
        }

        // Calculate metrics
        const totalVendido = filteredCompras.reduce((sum, c) => sum + (c.total || 0), 0);
        
        // For funciones vendidas: use analytics value when no amount filters, otherwise approximate
        let funcionesVendidas;
        if (hasAmountFilters) {
            // When filtering by amount, approximate: each compra typically represents one function
            funcionesVendidas = filteredCompras.length;
        } else {
            // Use the value from analytics when no amount filters are applied
            funcionesVendidas = analytics.totalFunciones || filteredCompras.length;
        }
        
        // For entradas vendidas: use analytics value when no amount filters, otherwise approximate
        let entradasVendidas;
        if (hasAmountFilters) {
            // Approximation: each compra has at least one ticket
            // In a real scenario, we'd need to count butacas from DetallesCompra
            entradasVendidas = filteredCompras.length;
        } else {
            // Use analytics value or calculate from compras
            // Since analytics doesn't have entradasVendidas directly, use compras count as approximation
            entradasVendidas = filteredCompras.length;
        }
        
        const promedioPorFuncion = funcionesVendidas > 0 ? totalVendido / funcionesVendidas : 0;

        // Update analytics cards
        updateAnalyticsCards({
            totalVendido: totalVendido,
            funcionesVendidas: funcionesVendidas,
            entradasVendidas: entradasVendidas,
            promedioPorFuncion: promedioPorFuncion
        });

        // Display sales list
        displaySalesList(filteredCompras);

        showNotification("Filtros aplicados", "success");
    } catch (error) {
        console.error("Error applying filters:", error);
        showNotification("Error al aplicar filtros", "error");
    }
};

window.updateAnalyticsCards = function(metrics) {
    const cardsContainer = document.getElementById("analytics-cards");
    if (!cardsContainer) return;
    
    cardsContainer.innerHTML = `
        <div class="bg-cine-gray rounded-lg p-6">
            <h3 class="text-gray-400 mb-2">Total Vendido</h3>
            <p class="text-3xl font-bold">${formatCurrency(metrics.totalVendido || 0)}</p>
        </div>
        <div class="bg-cine-gray rounded-lg p-6">
            <h3 class="text-gray-400 mb-2">Funciones Vendidas</h3>
            <p class="text-3xl font-bold">${metrics.funcionesVendidas || 0}</p>
        </div>
        <div class="bg-cine-gray rounded-lg p-6">
            <h3 class="text-gray-400 mb-2">Entradas Vendidas</h3>
            <p class="text-3xl font-bold">${metrics.entradasVendidas || 0}</p>
        </div>
        <div class="bg-cine-gray rounded-lg p-6">
            <h3 class="text-gray-400 mb-2">Promedio por Función</h3>
            <p class="text-3xl font-bold">${formatCurrency(metrics.promedioPorFuncion || 0)}</p>
        </div>
    `;
}

window.displaySalesList = function(compras) {
    const salesListContainer = document.getElementById("sales-list-container");
    if (!salesListContainer) return;
    
    if (!compras || compras.length === 0) {
        salesListContainer.innerHTML = '<p class="text-gray-400 text-center py-8">No hay compras disponibles para los filtros seleccionados</p>';
        return;
    }
    
    // Sort by date (most recent first)
    const sortedCompras = [...compras].sort((a, b) => 
        new Date(b.fechaCompra) - new Date(a.fechaCompra)
    );
    
    salesListContainer.innerHTML = `
        <div class="overflow-x-auto">
            <table class="w-full">
                <thead>
                    <tr class="border-b border-gray-700">
                        <th class="text-left py-3 px-4 font-semibold">ID</th>
                        <th class="text-left py-3 px-4 font-semibold">Cliente</th>
                        <th class="text-left py-3 px-4 font-semibold">Película</th>
                        <th class="text-left py-3 px-4 font-semibold">Fecha</th>
                        <th class="text-left py-3 px-4 font-semibold">Forma de Pago</th>
                        <th class="text-right py-3 px-4 font-semibold">Total</th>
                        <th class="text-left py-3 px-4 font-semibold">Estado</th>
                    </tr>
                </thead>
                <tbody>
                    ${sortedCompras.map(compra => {
                        const fecha = new Date(compra.fechaCompra);
                        const fechaFormateada = fecha.toLocaleDateString('es-AR', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                        });
                        return `
                        <tr class="border-b border-gray-800 hover:bg-gray-800 transition">
                            <td class="py-3 px-4">#${compra.idCompra}</td>
                            <td class="py-3 px-4">${sanitizeInput(compra.nombreCliente || "N/A")}</td>
                            <td class="py-3 px-4">${sanitizeInput(compra.pelicula || "N/A")}</td>
                            <td class="py-3 px-4">${fechaFormateada}</td>
                            <td class="py-3 px-4">${sanitizeInput(compra.formaPago || "N/A")}</td>
                            <td class="text-right py-3 px-4 font-semibold">${formatCurrency(compra.total || 0)}</td>
                            <td class="py-3 px-4">
                                <span class="px-2 py-1 rounded text-xs ${
                                    compra.estado === "Completada" 
                                        ? "bg-green-900 text-green-300" 
                                        : "bg-gray-700 text-gray-300"
                                }">
                                    ${sanitizeInput(compra.estado || "N/A")}
                                </span>
                            </td>
                        </tr>
                    `;
                    }).join("")}
                </tbody>
            </table>
        </div>
    `;
}

