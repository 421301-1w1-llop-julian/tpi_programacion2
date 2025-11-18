// Global Utility Functions

window.addToCart = function (productId) {
    cart.addProduct(productId, 1);
    showNotification("Producto agregado al carrito", "success");
};

// Variable global para la página actual
window.currentPage = 1;

// global-functions.js (Función reemplazada/actualizada)

window.applyAnalyticsFilters = async function (
    pagina = 1,
    actualizarMetricas = true
) {
    const fechaInicio = document.getElementById("filter-date-start")?.value;
    const fechaFin = document.getElementById("filter-date-end")?.value;
    const montoMinimoInput =
        document.getElementById("filter-amount-min")?.value;
    const montoMaximoInput =
        document.getElementById("filter-amount-max")?.value;

    // Parsear montos correctamente
    const montoMinimo =
        montoMinimoInput && montoMinimoInput.trim() !== ""
            ? isNaN(parseFloat(montoMinimoInput))
                ? null
                : parseFloat(montoMinimoInput)
            : null;
    const montoMaximo =
        montoMaximoInput && montoMaximoInput.trim() !== ""
            ? isNaN(parseFloat(montoMaximoInput))
                ? null
                : parseFloat(montoMaximoInput)
            : null;

    // Build backend filters
    const backendFilters = {};
    if (fechaInicio) backendFilters.fechaDesde = fechaInicio;
    if (fechaFin) backendFilters.fechaHasta = fechaFin;
    // Agregar filtros de monto al objeto de filtros
    if (montoMinimo !== null && montoMinimo >= 0) {
        backendFilters.montoMinimo = montoMinimo;
    }
    if (montoMaximo !== null && montoMaximo >= 0) {
        backendFilters.montoMaximo = montoMaximo;
    }

    console.log("Filtros enviados al backend:", backendFilters);
    console.log(
        "Valores parseados - montoMinimo:",
        montoMinimo,
        "montoMaximo:",
        montoMaximo
    );

    // Actualizar página actual
    window.currentPage = pagina;

    try {
        const [analytics, comprasResponse] = await Promise.all([
            // api.getAnalytics ahora incluye filtros de monto (debe ser implementado en api.js y el backend)
            api.getAnalytics(backendFilters),
            api.getCompras(backendFilters, pagina, 10),
        ]);

        // Extraer datos de la respuesta paginada
        const compras = comprasResponse.datos || comprasResponse.Datos || [];
        const totalCompras =
            comprasResponse.totalRegistros ||
            comprasResponse.TotalRegistros ||
            0;
        const totalPaginas =
            comprasResponse.totalPaginas || comprasResponse.TotalPaginas || 1;
        const paginaActual =
            comprasResponse.paginaActual || comprasResponse.PaginaActual || 1;

        // Si se va a actualizar métricas O si es el primer llamado (dashboardViewHandler)
        if (actualizarMetricas) {
            // Usar valores del endpoint de analytics (asumiendo que ahora el backend los filtra correctamente)
            const totalVendido =
                analytics.ingresosTotales || analytics.IngresosTotales || 0;
            const funcionesVendidas =
                analytics.totalFunciones || analytics.TotalFunciones || 0;
            const entradasVendidas =
                analytics.totalCompras || analytics.TotalCompras || 0;
            const promedioPorFuncion =
                funcionesVendidas > 0 ? totalVendido / funcionesVendidas : 0;

            // Si analytics.peliculaMasVista existe, también actualizar el card
            const peliculaMasVista =
                analytics.peliculaMasVista?.nombre || "N/A";

            // Actualizar tarjetas de analíticas
            updateAnalyticsCards({
                totalVendido: totalVendido,
                funcionesVendidas: funcionesVendidas, // Si el backend no devuelve funcionesVendidas, usar el total de compras.
                entradasVendidas: analytics.entradasVendidas,
                promedioPorFuncion: analytics.ingresoPromedioFuncion,
                peliculaMasVista: peliculaMasVista,
            });
        }

        // Validar que la página actual no exceda el total de páginas
        const paginaValida = Math.min(paginaActual, totalPaginas);

        // Si la página solicitada excede el total, recargar con la última página válida (corrección de paginación)
        if (paginaActual > totalPaginas && totalPaginas > 0) {
            await applyAnalyticsFilters(totalPaginas, false);
            return;
        }

        // Mostrar lista de ventas con paginación
        displaySalesList(compras, {
            paginaActual: paginaValida,
            totalPaginas: totalPaginas,
            totalRegistros: totalCompras,
        });

        if (actualizarMetricas) {
            showNotification("Filtros aplicados", "success");
        }
    } catch (error) {
        console.error("Error applying filters:", error);
        showNotification("Error al aplicar filtros", "error");
    }
};

// ... También ajustamos updateAnalyticsCards para reflejar la nueva métrica

window.updateAnalyticsCards = function (metrics) {
    const cardsContainer = document.getElementById("analytics-cards");
    if (!cardsContainer) return;

    cardsContainer.innerHTML = `
        <div class="bg-cine-gray rounded-lg p-6">
            <h3 class="text-gray-400 mb-2">Total Vendido</h3>
            <p class="text-3xl font-bold">${formatCurrency(
                metrics.totalVendido || 0
            )}</p>
        </div>
        <div class="bg-cine-gray rounded-lg p-6">
            <h3 class="text-gray-400 mb-2">Pelicula más vista</h3>
            <p class="text-3xl font-bold">${
                metrics.peliculaMasVista || "N/A"
            }</p>
        </div>
        <div class="bg-cine-gray rounded-lg p-6">
            <h3 class="text-gray-400 mb-2">Entradas Vendidas</h3>
            <p class="text-3xl font-bold">${metrics.entradasVendidas || 0}</p>
        </div>
        <div class="bg-cine-gray rounded-lg p-6">
            <h3 class="text-gray-400 mb-2">Promedio por Función</h3>
            <p class="text-3xl font-bold">${formatCurrency(
                metrics.promedioPorFuncion || 0
            )}</p>
        </div>
    `;
};

window.displaySalesList = function (compras, paginacion = null) {
    const salesListContainer = document.getElementById("sales-list-container");
    if (!salesListContainer) return;

    if (!compras || compras.length === 0) {
        salesListContainer.innerHTML =
            '<p class="text-gray-400 text-center py-8">No hay compras disponibles para los filtros seleccionados</p>';
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
                        Página ${paginaActual} de ${totalPaginas} ${
                paginacion.totalRegistros
                    ? `(${paginacion.totalRegistros} registros)`
                    : ""
            }
                    </div>
                    <div class="flex gap-2">
                        <button 
                            onclick="applyAnalyticsFilters(${Math.max(
                                1,
                                paginaActual - 1
                            )}, false)"
                            ${paginaActual <= 1 ? "disabled" : ""}
                            class="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 transition text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            ${
                                paginaActual <= 1
                                    ? 'style="pointer-events: none;"'
                                    : ""
                            }
                        >
                            Anterior
                        </button>
                        <button 
                            onclick="applyAnalyticsFilters(${Math.min(
                                totalPaginas,
                                paginaActual + 1
                            )}, false)"
                            ${paginaActual >= totalPaginas ? "disabled" : ""}
                            class="px-4 py-2 bg-cine-red rounded hover:bg-red-700 transition text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            ${
                                paginaActual >= totalPaginas
                                    ? 'style="pointer-events: none;"'
                                    : ""
                            }
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
                    ${sortedCompras
                        .map((compra) => {
                            const fecha = new Date(
                                compra.fechaCompra || compra.FechaCompra
                            );
                            const fechaFormateada = fecha.toLocaleDateString(
                                "es-AR",
                                {
                                    year: "numeric",
                                    month: "2-digit",
                                    day: "2-digit",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                }
                            );
                            const idCompra = compra.idCompra || compra.IdCompra;
                            const nombreCliente =
                                compra.nombreCliente ||
                                compra.NombreCliente ||
                                "N/A";
                            const pelicula =
                                compra.pelicula || compra.Pelicula || "N/A";
                            const formaPago =
                                compra.formaPago || compra.FormaPago || "N/A";
                            const total = compra.total || compra.Total || 0;
                            const estado =
                                compra.estado || compra.Estado || "N/A";
                            return `
                        <tr class="border-b border-gray-800 hover:bg-gray-800 transition">
                            <td class="py-3 px-4">#${idCompra}</td>
                            <td class="py-3 px-4">${sanitizeInput(
                                nombreCliente
                            )}</td>
                            <td class="py-3 px-4">${sanitizeInput(
                                pelicula
                            )}</td>
                            <td class="py-3 px-4">${fechaFormateada}</td>
                            <td class="py-3 px-4">${sanitizeInput(
                                formaPago
                            )}</td>
                            <td class="text-right py-3 px-4 font-semibold">${formatCurrency(
                                total
                            )}</td>
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
                        })
                        .join("")}
                </tbody>
            </table>
        </div>
        ${paginacionHTML}
    `;
};

window.clearAnalyticsFilters = async function () {
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
