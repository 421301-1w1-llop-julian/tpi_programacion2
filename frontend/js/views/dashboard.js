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
                reject(
                    new Error(
                        `Element ${selector} not found after ${maxRetries} retries`
                    )
                );
            }
        };
        check();
    });
}

async function dashboardViewHandler() {
    // Check authentication and admin status
    if (!auth.isAuthenticated()) {
        showNotification(
            "Debes iniciar sesión para acceder al dashboard.",
            "error"
        );
        router.navigate("/login");
        return;
    }

    if (!auth.isAdmin()) {
        showNotification(
            "Acceso denegado. Solo administradores pueden acceder al dashboard.",
            "error"
        );
        router.navigate("/");
        return;
    }

    // Initialize dashboard UI
    initDashboardMobileMenu();
    updateDashboardNavLinks("/dashboard");

    try {
        // Wait for elements to be in the DOM (they should already be in the HTML)
        const cardsContainer = await waitForElement("#analytics-cards");
        const salesListContainer = await waitForElement(
            "#sales-list-container"
        );

        console.log("Elements found:", {
            cards: !!cardsContainer,
            sales: !!salesListContainer,
        });

        // Load dashboard data
        console.log("Loading dashboard data...");
        window.currentPage = 1;

        const [analytics, comprasResponse] = await Promise.all([
            api.getAnalytics().catch((err) => {
                console.error("Error fetching analytics:", err);
                if (
                    err.message.includes("401") ||
                    err.message.includes("Unauthorized")
                ) {
                    showNotification(
                        "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
                        "error"
                    );
                    auth.logout();
                    router.navigate("/login");
                    throw err;
                }
                return {
                    ingresosTotales: 0,
                    totalFunciones: 0,
                    totalCompras: 0,
                    totalReservas: 0,
                };
            }),
            api.getCompras({}, 1, 10).catch((err) => {
                console.error("Error fetching compras:", err);
                if (
                    err.message.includes("401") ||
                    err.message.includes("Unauthorized")
                ) {
                    showNotification(
                        "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
                        "error"
                    );
                    auth.logout();
                    router.navigate("/login");
                    throw err;
                }
                return {
                    datos: [],
                    totalRegistros: 0,
                    totalPaginas: 1,
                    paginaActual: 1,
                };
            }),
        ]);

        console.log("Analytics data:", analytics);
        console.log("Compras data:", comprasResponse);

        const compras = comprasResponse.datos || comprasResponse.Datos || [];

        const paginaActual =
            comprasResponse.paginaActual || comprasResponse.PaginaActual || 1;
        const totalPaginas =
            comprasResponse.totalPaginas || comprasResponse.TotalPaginas || 1;
        // La paginación depende de que totalRegistros sea > 0
        const totalRegistros =
            comprasResponse.totalRegistros ||
            comprasResponse.totalRegistros ||
            0;

        displaySalesList(compras, {
            paginaActual: paginaActual,
            totalPaginas: totalPaginas,
            totalRegistros: totalRegistros,
        });
        // Update analytics cards
        cardsContainer.innerHTML = `
            <div class="bg-cine-gray rounded-lg p-6 shadow-lg">
                <h3 class="text-gray-400 mb-2 text-sm uppercase tracking-wide">Total Vendido</h3>
                <p class="text-3xl font-bold text-white">${formatCurrency(
                    analytics.ingresosTotales
                )}</p>
            </div>
            <div class="bg-cine-gray rounded-lg p-6 shadow-lg">
                <h3 class="text-gray-400 mb-2 text-sm uppercase tracking-wide">Pelicula más vista</h3>
                <p class="text-3xl font-bold text-white">${
                    analytics.peliculaMasVista.nombre || "N/A"
                }</p>
            </div>
            <div class="bg-cine-gray rounded-lg p-6 shadow-lg">
                <h3 class="text-gray-400 mb-2 text-sm uppercase tracking-wide">Entradas Vendidas</h3>
                <p class="text-3xl font-bold text-white">${
                    analytics.entradasVendidas
                }</p>
            </div>
            <div class="bg-cine-gray rounded-lg p-6 shadow-lg">
                <h3 class="text-gray-400 mb-2 text-sm uppercase tracking-wide">Promedio por Función</h3>
                <p class="text-3xl font-bold text-white">${formatCurrency(
                    analytics.ingresoPromedioFuncion
                )}</p>
            </div>
        `;

        // Display sales list with pagination
        displaySalesList(compras, {
            paginaActual: paginaActual,
            totalPaginas: totalPaginas,
            totalRegistros: totalRegistros,
        });
    } catch (error) {
        console.error("Error loading dashboard:", error);

        // Try to show error in the containers if they exist
        const cardsContainer = document.querySelector("#analytics-cards");
        const salesListContainer = document.querySelector(
            "#sales-list-container"
        );

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
