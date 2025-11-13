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

    // Find or create elements - simplified approach
    const ensureElementsExist = () => {
        return new Promise((resolve) => {
            // First, try to find elements directly
            let cardsContainer = document.getElementById("analytics-cards");
            let salesListContainer = document.getElementById("sales-list-container");
            
            if (cardsContainer && salesListContainer) {
                console.log("Elements found immediately");
                resolve({ cardsContainer, salesListContainer });
                return;
            }
            
            // Wait a bit and check again
            setTimeout(() => {
                cardsContainer = document.getElementById("analytics-cards");
                salesListContainer = document.getElementById("sales-list-container");
                
                if (cardsContainer && salesListContainer) {
                    console.log("Elements found after short wait");
                    resolve({ cardsContainer, salesListContainer });
                    return;
                }
                
                // If still not found, create them
                console.warn("Elements not found, creating them...");
                let dashboardContent = document.getElementById("dashboard-content");
                console.log("dashboard-content found:", !!dashboardContent);
                
                // If dashboard-content doesn't exist, try to find main or create structure
                if (!dashboardContent) {
                    console.warn("dashboard-content not found, looking for main or app...");
                    dashboardContent = document.querySelector("main") || document.querySelector("#app > main");
                    
                    if (!dashboardContent) {
                        // Create the main structure
                        console.warn("Creating dashboard structure...");
                        const app = document.getElementById("app");
                        if (app) {
                            // Check if there's already a flex container
                            let flexContainer = app.querySelector(".flex.min-h-screen");
                            if (!flexContainer) {
                                flexContainer = document.createElement("div");
                                flexContainer.className = "flex min-h-screen";
                                app.innerHTML = ""; // Clear existing content
                                app.appendChild(flexContainer);
                            }
                            
                            // Create main content area
                            dashboardContent = document.createElement("main");
                            dashboardContent.id = "dashboard-content";
                            dashboardContent.className = "flex-1 md:ml-64 p-8";
                            dashboardContent.innerHTML = `
                                <h1 class="text-4xl font-bold mb-8">Analíticas</h1>
                                <div class="bg-cine-gray rounded-lg p-6 mb-8">
                                    <h2 class="text-xl font-bold mb-4">Filtros</h2>
                                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div>
                                            <label class="block text-sm font-medium mb-2">Fecha Inicio</label>
                                            <input type="date" id="filter-date-start" class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded">
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium mb-2">Fecha Fin</label>
                                            <input type="date" id="filter-date-end" class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded">
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium mb-2">Monto Mínimo</label>
                                            <input type="number" id="filter-amount-min" class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded">
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium mb-2">Monto Máximo</label>
                                            <input type="number" id="filter-amount-max" class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded">
                                        </div>
                                    </div>
                                    <button onclick="applyAnalyticsFilters()" class="mt-4 bg-cine-red px-6 py-2 rounded hover:bg-red-700 transition">
                                        Aplicar Filtros
                                    </button>
                                </div>
                            `;
                            flexContainer.appendChild(dashboardContent);
                            console.log("Created dashboard-content structure");
                        } else {
                            console.error("App container not found!");
                            resolve({ cardsContainer: null, salesListContainer: null });
                            return;
                        }
                    }
                }
                
                // Create analytics-cards
                if (!cardsContainer) {
                    console.log("Creating analytics-cards...");
                    cardsContainer = document.createElement("div");
                    cardsContainer.id = "analytics-cards";
                    cardsContainer.className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8";
                    
                    // Find filters div and insert after it
                    const filtersDiv = dashboardContent.querySelector('[id="filter-date-start"]')?.closest('.bg-cine-gray');
                    console.log("Filters div found:", !!filtersDiv);
                    
                    if (filtersDiv && filtersDiv.parentNode) {
                        // Insert after the filters div
                        if (filtersDiv.nextSibling) {
                            filtersDiv.parentNode.insertBefore(cardsContainer, filtersDiv.nextSibling);
                        } else {
                            filtersDiv.parentNode.appendChild(cardsContainer);
                        }
                        console.log("Inserted analytics-cards after filters");
                    } else {
                        // Find the h1 "Analíticas" and insert after it
                        const h1 = dashboardContent.querySelector("h1");
                        if (h1) {
                            if (h1.nextSibling) {
                                h1.parentNode.insertBefore(cardsContainer, h1.nextSibling);
                            } else {
                                h1.parentNode.appendChild(cardsContainer);
                            }
                        } else {
                            dashboardContent.appendChild(cardsContainer);
                        }
                        console.log("Appended analytics-cards to dashboard-content");
                    }
                }
                
                // Create sales-list-container
                if (!salesListContainer) {
                    console.log("Creating sales-list-container...");
                    const salesDiv = document.createElement("div");
                    salesDiv.className = "bg-cine-gray rounded-lg p-6";
                    salesDiv.innerHTML = `
                        <h2 class="text-xl font-bold mb-4">Ventas por Día</h2>
                        <div id="sales-list-container"></div>
                    `;
                    
                    // Insert after analytics-cards or at the end
                    if (cardsContainer && cardsContainer.parentNode) {
                        if (cardsContainer.nextSibling) {
                            cardsContainer.parentNode.insertBefore(salesDiv, cardsContainer.nextSibling);
                        } else {
                            cardsContainer.parentNode.appendChild(salesDiv);
                        }
                        console.log("Inserted sales div after analytics-cards");
                    } else {
                        dashboardContent.appendChild(salesDiv);
                        console.log("Appended sales div to dashboard-content");
                    }
                    
                    salesListContainer = salesDiv.querySelector("#sales-list-container");
                    console.log("sales-list-container found after creation:", !!salesListContainer);
                }
                
                // Final verification
                if (!cardsContainer) {
                    cardsContainer = document.getElementById("analytics-cards");
                }
                if (!salesListContainer) {
                    salesListContainer = document.getElementById("sales-list-container");
                }
                
                console.log("Final check - cardsContainer:", !!cardsContainer, "salesListContainer:", !!salesListContainer);
                resolve({ cardsContainer, salesListContainer });
            }, 500); // Wait 500ms before creating
        });
    };

    try {
        // First, let's see what's actually in the DOM
        const app = document.getElementById("app");
        console.log("App element:", app);
        console.log("App innerHTML length:", app?.innerHTML?.length || 0);
        console.log("App innerHTML contains 'dashboard-content':", app?.innerHTML?.includes("dashboard-content") || false);
        console.log("App innerHTML contains 'analytics-cards':", app?.innerHTML?.includes("analytics-cards") || false);
        
        // Try to find dashboard-content in different ways
        const dashboardContent1 = document.getElementById("dashboard-content");
        const dashboardContent2 = document.querySelector("#dashboard-content");
        const dashboardContent3 = app?.querySelector("#dashboard-content");
        const dashboardContent4 = app?.querySelector("main");
        
        console.log("dashboard-content searches:", {
            byId: !!dashboardContent1,
            byQuerySelector: !!dashboardContent2,
            inApp: !!dashboardContent3,
            mainTag: !!dashboardContent4
        });
        
        console.log("Ensuring dashboard elements exist...");
        const { cardsContainer, salesListContainer } = await ensureElementsExist();
        console.log("Elements ready:", { 
            cards: !!cardsContainer, 
            sales: !!salesListContainer 
        });
        
        if (!cardsContainer || !salesListContainer) {
            // Last resort: create elements directly in app
            console.warn("Last resort: creating elements directly in app");
            const appEl = document.getElementById("app");
            if (appEl) {
                // Find or create main
                let mainEl = appEl.querySelector("main") || appEl.querySelector("#dashboard-content");
                if (!mainEl) {
                    mainEl = document.createElement("main");
                    mainEl.id = "dashboard-content";
                    mainEl.className = "flex-1 md:ml-64 p-8";
                    appEl.appendChild(mainEl);
                }
                
                // Create cards container
                if (!cardsContainer) {
                    const cardsEl = document.createElement("div");
                    cardsEl.id = "analytics-cards";
                    cardsEl.className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8";
                    mainEl.appendChild(cardsEl);
                    cardsContainer = cardsEl;
                }
                
                // Create sales container
                if (!salesListContainer) {
                    const salesDiv = document.createElement("div");
                    salesDiv.className = "bg-cine-gray rounded-lg p-6";
                    salesDiv.innerHTML = `
                        <h2 class="text-xl font-bold mb-4">Ventas por Día</h2>
                        <div id="sales-list-container"></div>
                    `;
                    mainEl.appendChild(salesDiv);
                    salesListContainer = salesDiv.querySelector("#sales-list-container");
                }
                
                console.log("Created elements as last resort:", {
                    cards: !!cardsContainer,
                    sales: !!salesListContainer
                });
            }
        }
        
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

