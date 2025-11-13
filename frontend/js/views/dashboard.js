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

    // Find or create elements using MutationObserver
    const ensureElementsExist = () => {
        return new Promise((resolve) => {
            let cardsContainer = document.getElementById("analytics-cards");
            let salesListContainer = document.getElementById("sales-list-container");
            
            // If already found, return immediately
            if (cardsContainer && salesListContainer) {
                console.log("Elements found immediately");
                resolve({ cardsContainer, salesListContainer });
                return;
            }
            
            // Use MutationObserver to watch for elements being added
            const observer = new MutationObserver((mutations) => {
                if (!cardsContainer) {
                    cardsContainer = document.getElementById("analytics-cards");
                }
                if (!salesListContainer) {
                    salesListContainer = document.getElementById("sales-list-container");
                }
                
                if (cardsContainer && salesListContainer) {
                    observer.disconnect();
                    console.log("Elements found via MutationObserver");
                    resolve({ cardsContainer, salesListContainer });
                }
            });
            
            // Start observing
            const app = document.getElementById("app");
            if (app) {
                observer.observe(app, {
                    childList: true,
                    subtree: true
                });
                
                // Also check periodically as fallback
                let attempts = 0;
                const checkInterval = setInterval(() => {
                    attempts++;
                    if (!cardsContainer) {
                        cardsContainer = document.getElementById("analytics-cards");
                    }
                    if (!salesListContainer) {
                        salesListContainer = document.getElementById("sales-list-container");
                    }
                    
                    if (cardsContainer && salesListContainer) {
                        clearInterval(checkInterval);
                        observer.disconnect();
                        console.log("Elements found via interval check");
                        resolve({ cardsContainer, salesListContainer });
                    } else if (attempts >= 30) {
                        clearInterval(checkInterval);
                        observer.disconnect();
                        console.warn("Elements not found, creating them...");
                        
                        // Create elements as fallback
                        const dashboardContent = document.getElementById("dashboard-content");
                        if (dashboardContent) {
                            if (!cardsContainer) {
                                cardsContainer = document.createElement("div");
                                cardsContainer.id = "analytics-cards";
                                cardsContainer.className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8";
                                
                                // Find filters div and insert after it
                                const filtersDiv = dashboardContent.querySelector('[id="filter-date-start"]')?.closest('.bg-cine-gray');
                                if (filtersDiv && filtersDiv.parentNode) {
                                    filtersDiv.parentNode.insertBefore(cardsContainer, filtersDiv.nextSibling);
                                } else {
                                    dashboardContent.appendChild(cardsContainer);
                                }
                            }
                            
                            if (!salesListContainer) {
                                const salesDiv = document.createElement("div");
                                salesDiv.className = "bg-cine-gray rounded-lg p-6";
                                salesDiv.innerHTML = `
                                    <h2 class="text-xl font-bold mb-4">Ventas por Día</h2>
                                    <div id="sales-list-container"></div>
                                `;
                                salesListContainer = salesDiv.querySelector("#sales-list-container");
                                
                                if (cardsContainer && cardsContainer.parentNode) {
                                    cardsContainer.parentNode.insertBefore(salesDiv, cardsContainer.nextSibling);
                                } else {
                                    dashboardContent.appendChild(salesDiv);
                                }
                            }
                        }
                        
                        resolve({ cardsContainer, salesListContainer });
                    }
                }, 100);
            } else {
                // App not found, create elements anyway
                console.warn("App container not found, creating elements in body");
                cardsContainer = document.createElement("div");
                cardsContainer.id = "analytics-cards";
                cardsContainer.className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8";
                
                const salesDiv = document.createElement("div");
                salesDiv.className = "bg-cine-gray rounded-lg p-6";
                salesDiv.innerHTML = `
                    <h2 class="text-xl font-bold mb-4">Ventas por Día</h2>
                    <div id="sales-list-container"></div>
                `;
                salesListContainer = salesDiv.querySelector("#sales-list-container");
                
                document.body.appendChild(cardsContainer);
                document.body.appendChild(salesDiv);
                
                resolve({ cardsContainer, salesListContainer });
            }
        });
    };

    try {
        console.log("Ensuring dashboard elements exist...");
        const { cardsContainer, salesListContainer } = await ensureElementsExist();
        console.log("Elements ready:", { 
            cards: !!cardsContainer, 
            sales: !!salesListContainer 
        });
        
        if (!cardsContainer || !salesListContainer) {
            throw new Error("Could not find or create required dashboard elements");
        }
        
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

        // Update analytics cards (use the one we found/created earlier)
        console.log("Updating analytics cards, container found:", !!cardsContainer);
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
            console.log("Analytics cards updated successfully");
        } else {
            console.error("Analytics cards container not available!");
            // Try to get it one more time
            const fallbackCards = document.getElementById("analytics-cards") || document.querySelector("#analytics-cards");
            if (fallbackCards) {
                console.log("Found cards container on fallback, updating...");
                fallbackCards.innerHTML = `
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
            }
        }

        // Display sales list (use the one we found/created earlier)
        console.log("Updating sales list, container found:", !!salesListContainer);
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
            console.error("Sales list container not available!");
            // Try to get it one more time
            const fallbackSales = document.getElementById("sales-list-container") || document.querySelector("#sales-list-container");
            if (fallbackSales) {
                console.log("Found sales container on fallback, updating...");
                if (!compras || !Array.isArray(compras) || compras.length === 0) {
                    fallbackSales.innerHTML = '<p class="text-gray-400 text-center py-8">No hay compras disponibles</p>';
                } else {
                    const sortedCompras = [...compras].sort((a, b) => 
                        new Date(b.fechaCompra) - new Date(a.fechaCompra)
                    );
                    fallbackSales.innerHTML = `
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
            }
        }
    } catch (error) {
        console.error("Error loading dashboard:", error);
        console.error("Error stack:", error.stack);
        
        // Try to find elements again in case they weren't found initially
        let cardsContainer = document.getElementById("analytics-cards");
        let salesListContainer = document.getElementById("sales-list-container");
        
        // If still not found, try querySelector as fallback
        if (!cardsContainer) {
            cardsContainer = document.querySelector("#analytics-cards");
            console.log("Trying querySelector for analytics-cards:", !!cardsContainer);
        }
        if (!salesListContainer) {
            salesListContainer = document.querySelector("#sales-list-container");
            console.log("Trying querySelector for sales-list-container:", !!salesListContainer);
        }
        
        if (cardsContainer) {
            cardsContainer.innerHTML = `
                <div class="bg-red-900 bg-opacity-50 border border-red-500 rounded p-4 col-span-4">
                    <p class="text-red-300">Error al cargar las analíticas: ${error.message}</p>
                    <p class="text-red-300 text-sm mt-2">Por favor, recarga la página o contacta al administrador.</p>
                </div>
            `;
        } else {
            console.error("Could not find analytics-cards container even after error!");
        }
        
        if (salesListContainer) {
            salesListContainer.innerHTML = `
                <div class="bg-red-900 bg-opacity-50 border border-red-500 rounded p-4">
                    <p class="text-red-300">Error al cargar las compras: ${error.message}</p>
                    <p class="text-red-300 text-sm mt-2">Por favor, recarga la página o contacta al administrador.</p>
                </div>
            `;
        } else {
            console.error("Could not find sales-list-container even after error!");
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

