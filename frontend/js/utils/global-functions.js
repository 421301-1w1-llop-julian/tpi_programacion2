// Global Utility Functions

window.addToCart = function (productId) {
    cart.addProduct(productId, 1);
    showNotification("Producto agregado al carrito", "success");
};

// Variable global para la página actual
window.currentPage = 1;

window.applyAnalyticsFilters = async function (pagina = 1) {
    const fechaInicio = document.getElementById("filter-date-start")?.value;
    const fechaFin = document.getElementById("filter-date-end")?.value;
    const montoMinimo = parseFloat(document.getElementById("filter-amount-min")?.value) || null;
    const montoMaximo = parseFloat(document.getElementById("filter-amount-max")?.value) || null;

    // Build backend filters
    const backendFilters = {};
    if (fechaInicio) backendFilters.fechaDesde = fechaInicio;
    if (fechaFin) backendFilters.fechaHasta = fechaFin;

    // Actualizar página actual
    window.currentPage = pagina;

    try {
        const [analytics, comprasResponse] = await Promise.all([
            api.getAnalytics(backendFilters),
            api.getCompras(backendFilters, pagina, 10)
        ]);

        // La respuesta ahora es un objeto paginado
        const compras = comprasResponse.datos || comprasResponse.Datos || [];
        const totalCompras = comprasResponse.totalRegistros || comprasResponse.TotalRegistros || 0;
        const totalPaginas = comprasResponse.totalPaginas || comprasResponse.TotalPaginas || 1;
        const paginaActual = comprasResponse.paginaActual || comprasResponse.PaginaActual || 1;

        // Apply amount filters on frontend (since backend doesn't support it)
        let filteredCompras = compras || [];
        const hasAmountFilters = montoMinimo !== null || montoMaximo !== null;
        
        if (montoMinimo !== null) {
            filteredCompras = filteredCompras.filter(c => (c.total || c.Total || 0) >= montoMinimo);
        }
        if (montoMaximo !== null) {
            filteredCompras = filteredCompras.filter(c => (c.total || c.Total || 0) <= montoMaximo);
        }

        // Calculate metrics
        const totalVendido = filteredCompras.reduce((sum, c) => sum + (c.total || c.Total || 0), 0);
        
        // For funciones vendidas: use analytics value when no amount filters, otherwise approximate
        let funcionesVendidas;
        if (hasAmountFilters) {
            // When filtering by amount, approximate: each compra typically represents one function
            funcionesVendidas = filteredCompras.length;
        } else {
            // Use the value from analytics when no amount filters are applied
            funcionesVendidas = analytics.totalFunciones || analytics.TotalFunciones || filteredCompras.length;
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

        // Display sales list with pagination
        displaySalesList(filteredCompras, {
            paginaActual: paginaActual,
            totalPaginas: totalPaginas,
            totalRegistros: totalCompras
        });

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

window.displaySalesList = function(compras, paginacion = null) {
    const salesListContainer = document.getElementById("sales-list-container");
    if (!salesListContainer) return;
    
    if (!compras || compras.length === 0) {
        salesListContainer.innerHTML = '<p class="text-gray-400 text-center py-8">No hay compras disponibles para los filtros seleccionados</p>';
        return;
    }
    
    // Sort by date (most recent first) - aunque ya viene ordenado del backend
    const sortedCompras = [...compras].sort((a, b) => {
        const fechaA = new Date(a.fechaCompra || a.FechaCompra);
        const fechaB = new Date(b.fechaCompra || b.FechaCompra);
        return fechaB - fechaA;
    });
    
    let paginacionHTML = "";
    if (paginacion && paginacion.totalPaginas > 1) {
        const { paginaActual, totalPaginas } = paginacion;
        paginacionHTML = `
            <div class="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
                <div class="text-sm text-gray-400">
                    Página ${paginaActual} de ${totalPaginas}
                </div>
                <div class="flex gap-2">
                    <button 
                        onclick="applyAnalyticsFilters(${paginaActual - 1})"
                        ${paginaActual <= 1 ? 'disabled' : ''}
                        class="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 transition text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        ${paginaActual <= 1 ? 'style="pointer-events: none;"' : ''}
                    >
                        Anterior
                    </button>
                    <button 
                        onclick="applyAnalyticsFilters(${paginaActual + 1})"
                        ${paginaActual >= totalPaginas ? 'disabled' : ''}
                        class="px-4 py-2 bg-cine-red rounded hover:bg-red-700 transition text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        ${paginaActual >= totalPaginas ? 'style="pointer-events: none;"' : ''}
                    >
                        Siguiente
                    </button>
                </div>
            </div>
        `;
    }
    
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
                        const fecha = new Date(compra.fechaCompra || compra.FechaCompra);
                        const fechaFormateada = fecha.toLocaleDateString('es-AR', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                        });
                        const idCompra = compra.idCompra || compra.IdCompra;
                        const nombreCliente = compra.nombreCliente || compra.NombreCliente || "N/A";
                        const pelicula = compra.pelicula || compra.Pelicula || "N/A";
                        const formaPago = compra.formaPago || compra.FormaPago || "N/A";
                        const total = compra.total || compra.Total || 0;
                        const estado = compra.estado || compra.Estado || "N/A";
                        return `
                        <tr class="border-b border-gray-800 hover:bg-gray-800 transition">
                            <td class="py-3 px-4">#${idCompra}</td>
                            <td class="py-3 px-4">${sanitizeInput(nombreCliente)}</td>
                            <td class="py-3 px-4">${sanitizeInput(pelicula)}</td>
                            <td class="py-3 px-4">${fechaFormateada}</td>
                            <td class="py-3 px-4">${sanitizeInput(formaPago)}</td>
                            <td class="text-right py-3 px-4 font-semibold">${formatCurrency(total)}</td>
                            <td class="py-3 px-4">
                                <span class="px-2 py-1 rounded text-xs ${
                                    estado === "Completada" 
                                        ? "bg-green-900 text-green-300" 
                                        : "bg-gray-700 text-gray-300"
                                }">
                                    ${sanitizeInput(estado)}
                                </span>
                            </td>
                        </tr>
                    `;
                    }).join("")}
                </tbody>
            </table>
        </div>
        ${paginacionHTML}
    `;
}

window.clearAnalyticsFilters = async function() {
    // Clear all filter inputs
    const fechaInicio = document.getElementById("filter-date-start");
    const fechaFin = document.getElementById("filter-date-end");
    const montoMinimo = document.getElementById("filter-amount-min");
    const montoMaximo = document.getElementById("filter-amount-max");
    
    if (fechaInicio) fechaInicio.value = "";
    if (fechaFin) fechaFin.value = "";
    if (montoMinimo) montoMinimo.value = "";
    if (montoMaximo) montoMaximo.value = "";
    
    // Resetear a página 1
    window.currentPage = 1;
    
    try {
        // Reload data without filters
        const [analytics, comprasResponse] = await Promise.all([
            api.getAnalytics(),
            api.getCompras({}, 1, 10)
        ]);
        
        // La respuesta ahora es un objeto paginado
        const compras = comprasResponse.datos || comprasResponse.Datos || [];
        const totalCompras = comprasResponse.totalRegistros || comprasResponse.TotalRegistros || 0;
        const totalPaginas = comprasResponse.totalPaginas || comprasResponse.TotalPaginas || 1;
        const paginaActual = comprasResponse.paginaActual || comprasResponse.PaginaActual || 1;
        
        // Calculate metrics
        const totalVendido = analytics.ingresosTotales || analytics.IngresosTotales || 0;
        const funcionesVendidas = analytics.totalFunciones || analytics.TotalFunciones || 0;
        const entradasVendidas = Array.isArray(compras) ? compras.reduce((sum, c) => sum + (c.cantidadEntradas || 1), 0) : 0;
        const promedioPorFuncion = funcionesVendidas > 0 ? totalVendido / funcionesVendidas : 0;
        
        // Update analytics cards
        updateAnalyticsCards({
            totalVendido: totalVendido,
            funcionesVendidas: funcionesVendidas,
            entradasVendidas: entradasVendidas,
            promedioPorFuncion: promedioPorFuncion
        });
        
        // Display sales list with pagination
        displaySalesList(compras, {
            paginaActual: paginaActual,
            totalPaginas: totalPaginas,
            totalRegistros: totalCompras
        });
        
        showNotification("Filtros limpiados", "success");
    } catch (error) {
        console.error("Error clearing filters:", error);
        showNotification("Error al limpiar filtros", "error");
    }
};

