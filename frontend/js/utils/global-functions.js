// Global Utility Functions

window.addToCart = function (productId) {
    cart.addProduct(productId, 1);
    showNotification("Producto agregado al carrito", "success");
};

// Variable global para la página actual
window.currentPage = 1;

window.applyAnalyticsFilters = async function (pagina = 1, actualizarMetricas = true) {
    const fechaInicio = document.getElementById("filter-date-start")?.value;
    const fechaFin = document.getElementById("filter-date-end")?.value;
    const montoMinimo = parseFloat(document.getElementById("filter-amount-min")?.value) || null;
    const montoMaximo = parseFloat(document.getElementById("filter-amount-max")?.value) || null;

    // Build backend filters (incluyendo filtros de monto)
    const backendFilters = {};
    if (fechaInicio) backendFilters.fechaDesde = fechaInicio;
    if (fechaFin) backendFilters.fechaHasta = fechaFin;
    if (montoMinimo !== null) backendFilters.montoMinimo = montoMinimo;
    if (montoMaximo !== null) backendFilters.montoMaximo = montoMaximo;

    // Actualizar página actual
    window.currentPage = pagina;

    try {
        const hasAmountFilters = montoMinimo !== null || montoMaximo !== null;
        
        // Si hay filtros de monto y necesitamos actualizar métricas, obtener todas las compras sin paginación
        let comprasCompletas = null;
        if (actualizarMetricas && hasAmountFilters) {
            // Obtener todas las compras sin paginación para calcular métricas correctamente
            const comprasCompletasResponse = await api.getCompras(backendFilters, null, null);
            // Si la respuesta es un array (sin paginación), usarlo directamente
            // Si es un objeto paginado, extraer los datos
            if (Array.isArray(comprasCompletasResponse)) {
                comprasCompletas = comprasCompletasResponse;
            } else {
                comprasCompletas = comprasCompletasResponse.datos || comprasCompletasResponse.Datos || [];
            }
        }

        const [analytics, comprasResponse] = await Promise.all([
            api.getAnalytics(backendFilters),
            api.getCompras(backendFilters, pagina, 10)
        ]);

        // La respuesta ahora es un objeto paginado
        const compras = comprasResponse.datos || comprasResponse.Datos || [];
        const totalCompras = comprasResponse.totalRegistros || comprasResponse.TotalRegistros || 0;
        const totalPaginas = comprasResponse.totalPaginas || comprasResponse.TotalPaginas || 1;
        const paginaActual = comprasResponse.paginaActual || comprasResponse.PaginaActual || 1;

        // Calcular métricas solo si se debe actualizar (no al cambiar de página)
        if (actualizarMetricas) {
            let totalVendido, funcionesVendidas, entradasVendidas, promedioPorFuncion;

            if (hasAmountFilters && comprasCompletas) {
                // Calcular métricas basadas en todas las compras filtradas
                totalVendido = comprasCompletas.reduce((sum, c) => sum + (c.total || c.Total || 0), 0);
                funcionesVendidas = comprasCompletas.length; // Aproximación
                entradasVendidas = comprasCompletas.length; // Aproximación
                promedioPorFuncion = funcionesVendidas > 0 ? totalVendido / funcionesVendidas : 0;
            } else {
                // Usar valores del endpoint de analytics (totales completos)
                totalVendido = analytics.ingresosTotales || analytics.IngresosTotales || 0;
                funcionesVendidas = analytics.totalFunciones || analytics.TotalFunciones || 0;
                // Para entradas vendidas, usar el total de compras del analytics o aproximar
                entradasVendidas = analytics.totalCompras || analytics.TotalCompras || totalCompras;
                promedioPorFuncion = funcionesVendidas > 0 ? totalVendido / funcionesVendidas : 0;
            }

            // Update analytics cards
            updateAnalyticsCards({
                totalVendido: totalVendido,
                funcionesVendidas: funcionesVendidas,
                entradasVendidas: entradasVendidas,
                promedioPorFuncion: promedioPorFuncion
            });
        }

        // Validar que la página actual no exceda el total de páginas
        const paginaValida = Math.min(paginaActual, totalPaginas);
        
        // Si la página solicitada excede el total, recargar con la última página válida
        if (paginaActual > totalPaginas && totalPaginas > 0) {
            await applyAnalyticsFilters(totalPaginas, false);
            return;
        }

        // Display sales list with pagination (ya no necesitamos filtrar en frontend, el backend lo hace)
        displaySalesList(compras, {
            paginaActual: paginaValida,
            totalPaginas: totalPaginas,
            totalRegistros: totalCompras
        });

        if (actualizarMetricas) {
            showNotification("Filtros aplicados", "success");
        }
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
    if (paginacion && paginacion.totalPaginas > 0) {
        const { paginaActual, totalPaginas } = paginacion;
        const mostrarPaginacion = totalPaginas > 1 || paginaActual > 1;
        
        if (mostrarPaginacion) {
            paginacionHTML = `
                <div class="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
                    <div class="text-sm text-gray-400">
                        Página ${paginaActual} de ${totalPaginas} ${paginacion.totalRegistros ? `(${paginacion.totalRegistros} registros)` : ''}
                    </div>
                    <div class="flex gap-2">
                        <button 
                            onclick="applyAnalyticsFilters(${Math.max(1, paginaActual - 1)}, false)"
                            ${paginaActual <= 1 ? 'disabled' : ''}
                            class="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 transition text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            ${paginaActual <= 1 ? 'style="pointer-events: none;"' : ''}
                        >
                            Anterior
                        </button>
                        <button 
                            onclick="applyAnalyticsFilters(${Math.min(totalPaginas, paginaActual + 1)}, false)"
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
    
    // Resetear a página 1 y recargar con métricas actualizadas
    window.currentPage = 1;
    
    // Llamar a applyAnalyticsFilters con página 1 y actualizar métricas
    await applyAnalyticsFilters(1, true);
    
    showNotification("Filtros limpiados", "success");
};

