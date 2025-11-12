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

    try {
        const analytics = await api.getAnalytics();
        const cardsContainer = document.getElementById("analytics-cards");
        if (cardsContainer) {
            cardsContainer.innerHTML = `
                <div class="bg-cine-gray rounded-lg p-6">
                    <h3 class="text-gray-400 mb-2">Total Vendido</h3>
                    <p class="text-3xl font-bold">${formatCurrency(
                        analytics.totalVendido || 0
                    )}</p>
                </div>
                <div class="bg-cine-gray rounded-lg p-6">
                    <h3 class="text-gray-400 mb-2">Funciones Vendidas</h3>
                    <p class="text-3xl font-bold">${
                        analytics.funcionesVendidas || 0
                    }</p>
                </div>
                <div class="bg-cine-gray rounded-lg p-6">
                    <h3 class="text-gray-400 mb-2">Entradas Vendidas</h3>
                    <p class="text-3xl font-bold">${
                        analytics.entradasVendidas || 0
                    }</p>
                </div>
                <div class="bg-cine-gray rounded-lg p-6">
                    <h3 class="text-gray-400 mb-2">Promedio por Función</h3>
                    <p class="text-3xl font-bold">${formatCurrency(
                        analytics.promedioPorFuncion || 0
                    )}</p>
                </div>
            `;
        }
    } catch (error) {
        console.error("Error loading analytics:", error);
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

