// Dashboard Handler
async function dashboardViewHandler() {
    if (!auth.isAdmin()) {
        showNotification(
            "Acceso denegado. Solo administradores pueden acceder al dashboard.",
            "error"
        );
        router.navigate("/");
        return;
    }

    initDashboardMobileMenu();
    updateDashboardNavLinks("/dashboard");

    // Wait for DOM elements to be available
    const waitForElements = () => {
        return new Promise((resolve) => {
            const checkElements = () => {
                const cardsContainer = document.getElementById("analytics-cards");
                const salesListContainer = document.getElementById("sales-list-container");
                if (cardsContainer && salesListContainer) {
                    resolve();
                } else {
                    setTimeout(checkElements, 50);
                }
            };
            checkElements();
        });
    };

    try {
        await waitForElements();
        console.log("Loading dashboard data...");
        const [analytics, compras] = await Promise.all([
            api.getAnalytics().catch(err => {
                console.error("Error fetching analytics:", err);
                return {
                    ingresosTotales: 0,
                    totalFunciones: 0,
                    totalCompras: 0,
                    totalReservas: 0
                };
            }),
            api.getCompras().catch(err => {
                console.error("Error fetching compras:", err);
                return [];
            })
        ]);

        console.log("Analytics data:", analytics);
        console.log("Compras data:", compras);

        // Calculate initial metrics
        const totalVendido = analytics.ingresosTotales || 0;
        const funcionesVendidas = analytics.totalFunciones || 0;
        const entradasVendidas = Array.isArray(compras) ? compras.reduce((sum, c) => sum + (c.cantidadEntradas || 1), 0) : 0;
        const promedioPorFuncion = funcionesVendidas > 0 ? totalVendido / funcionesVendidas : 0;

        // Update analytics cards
        const cardsContainer = document.getElementById("analytics-cards");
        if (cardsContainer) {
            cardsContainer.innerHTML = `
                <div class="bg-cine-gray rounded-lg p-6">
                    <h3 class="text-gray-400 mb-2">Total Vendido</h3>
                    <p class="text-3xl font-bold">${formatCurrency(totalVendido)}</p>
                </div>
                <div class="bg-cine-gray rounded-lg p-6">
                    <h3 class="text-gray-400 mb-2">Funciones Vendidas</h3>
                    <p class="text-3xl font-bold">${funcionesVendidas}</p>
                </div>
                <div class="bg-cine-gray rounded-lg p-6">
                    <h3 class="text-gray-400 mb-2">Entradas Vendidas</h3>
                    <p class="text-3xl font-bold">${entradasVendidas}</p>
                </div>
                <div class="bg-cine-gray rounded-lg p-6">
                    <h3 class="text-gray-400 mb-2">Promedio por Función</h3>
                    <p class="text-3xl font-bold">${formatCurrency(promedioPorFuncion)}</p>
                </div>
            `;
        } else {
            console.error("Analytics cards container not found!");
        }

        // Display sales list
        const salesListContainer = document.getElementById("sales-list-container");
        if (salesListContainer) {
            if (!compras || !Array.isArray(compras) || compras.length === 0) {
                salesListContainer.innerHTML = '<p class="text-gray-400 text-center py-8">No hay compras disponibles</p>';
            } else {
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
        } else {
            console.error("Sales list container not found!");
        }
    } catch (error) {
        console.error("Error loading dashboard:", error);
        const cardsContainer = document.getElementById("analytics-cards");
        const salesListContainer = document.getElementById("sales-list-container");
        
        if (cardsContainer) {
            cardsContainer.innerHTML = `
                <div class="bg-red-900 bg-opacity-50 border border-red-500 rounded p-4 col-span-4">
                    <p class="text-red-300">Error al cargar las analíticas: ${error.message}</p>
                </div>
            `;
        }
        
        if (salesListContainer) {
            salesListContainer.innerHTML = `
                <div class="bg-red-900 bg-opacity-50 border border-red-500 rounded p-4">
                    <p class="text-red-300">Error al cargar las compras: ${error.message}</p>
                </div>
            `;
        }
    }
}

// Dashboard Section Handler
async function dashboardSectionViewHandler(params) {
    if (!auth.isAdmin()) {
        showNotification("Acceso denegado", "error");
        router.navigate("/");
        return;
    }

    const section = params.section;
    initDashboardMobileMenu();
    updateDashboardNavLinks(`/dashboard/${section}`);

    switch (section) {
        case "peliculas":
            await loadMoviesCRUD();
            break;
        case "productos":
            await loadProductsCRUD();
            break;
        case "actores":
            await loadActorsCRUD();
            break;
        case "directores":
            await loadDirectorsCRUD();
            break;
        case "idiomas":
            await loadLanguagesCRUD();
            break;
        case "funciones":
            await loadFunctionsCRUD();
            break;
        default:
            router.navigate("/dashboard");
    }
}

