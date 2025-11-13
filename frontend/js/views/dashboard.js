// Dashboard View Handler

// Helper function to wait for an element with retries
function waitForElement(selector, maxRetries = 20, delay = 50) {
    return new Promise((resolve, reject) => {
        let retries = 0;
        const check = () => {
            const element = document.querySelector(selector);
            if (element) {
                resolve(element);
            } else if (retries < maxRetries) {
                retries++;
                setTimeout(check, delay);
            } else {
                reject(new Error(`Element ${selector} not found after ${maxRetries} retries`));
            }
        };
        check();
    });
}

async function dashboardViewHandler() {
    // Check authentication and admin status
    if (!auth.isAuthenticated()) {
        showNotification("Debes iniciar sesión para acceder al dashboard.", "error");
        router.navigate("/login");
        return;
    }

    if (!auth.isAdmin()) {
        showNotification("Acceso denegado. Solo administradores pueden acceder al dashboard.", "error");
        router.navigate("/");
        return;
    }

    // Initialize dashboard UI
    initDashboardMobileMenu();
    updateDashboardNavLinks("/dashboard");

    try {
        // Wait for elements to be in the DOM (they should already be in the HTML)
        const cardsContainer = await waitForElement("#analytics-cards");
        const salesListContainer = await waitForElement("#sales-list-container");
        
        console.log("Elements found:", {
            cards: !!cardsContainer,
            sales: !!salesListContainer
        });

        // Load dashboard data
        console.log("Loading dashboard data...");
        const [analytics, compras] = await Promise.all([
            api.getAnalytics().catch(err => {
                console.error("Error fetching analytics:", err);
                if (err.message.includes("401") || err.message.includes("Unauthorized")) {
                    showNotification("Tu sesión ha expirado. Por favor, inicia sesión nuevamente.", "error");
                    auth.logout();
                    router.navigate("/login");
                    throw err;
                }
                return {
                    ingresosTotales: 0,
                    totalFunciones: 0,
                    totalCompras: 0,
                    totalReservas: 0
                };
            }),
            api.getCompras().catch(err => {
                console.error("Error fetching compras:", err);
                if (err.message.includes("401") || err.message.includes("Unauthorized")) {
                    showNotification("Tu sesión ha expirado. Por favor, inicia sesión nuevamente.", "error");
                    auth.logout();
                    router.navigate("/login");
                    throw err;
                }
                return [];
            })
        ]);

        console.log("Analytics data:", analytics);
        console.log("Compras data:", compras);

        // Calculate metrics
        const totalVendido = analytics.ingresosTotales || 0;
        const funcionesVendidas = analytics.totalFunciones || 0;
        const entradasVendidas = Array.isArray(compras) ? compras.reduce((sum, c) => sum + (c.cantidadEntradas || 1), 0) : 0;
        const promedioPorFuncion = funcionesVendidas > 0 ? totalVendido / funcionesVendidas : 0;

        // Update analytics cards
        cardsContainer.innerHTML = `
            <div class="bg-cine-gray rounded-lg p-6 shadow-lg">
                <h3 class="text-gray-400 mb-2 text-sm uppercase tracking-wide">Total Vendido</h3>
                <p class="text-3xl font-bold text-white">${formatCurrency(totalVendido)}</p>
            </div>
            <div class="bg-cine-gray rounded-lg p-6 shadow-lg">
                <h3 class="text-gray-400 mb-2 text-sm uppercase tracking-wide">Funciones Vendidas</h3>
                <p class="text-3xl font-bold text-white">${funcionesVendidas}</p>
            </div>
            <div class="bg-cine-gray rounded-lg p-6 shadow-lg">
                <h3 class="text-gray-400 mb-2 text-sm uppercase tracking-wide">Entradas Vendidas</h3>
                <p class="text-3xl font-bold text-white">${entradasVendidas}</p>
            </div>
            <div class="bg-cine-gray rounded-lg p-6 shadow-lg">
                <h3 class="text-gray-400 mb-2 text-sm uppercase tracking-wide">Promedio por Función</h3>
                <p class="text-3xl font-bold text-white">${formatCurrency(promedioPorFuncion)}</p>
            </div>
        `;

        // Display sales list
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
    } catch (error) {
        console.error("Error loading dashboard:", error);
        
        // Try to show error in the containers if they exist
        const cardsContainer = document.querySelector("#analytics-cards");
        const salesListContainer = document.querySelector("#sales-list-container");
        
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
