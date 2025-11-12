// Movie Candy Handler
let purchaseData = {
    movieId: null,
    funcionId: null,
    butacas: [],
    cantidad: 0,
    productos: [],
};

// Store current movie and function for quick updates
let currentMovie = null;
let currentFunction = null;

async function movieCandyViewHandler(params, queryParams) {
    const movieId = params.id;
    const funcionId = queryParams?.get("funcion");
    const butacasStr = queryParams?.get("butacas");
    const cantidad = queryParams?.get("cantidad");

    if (!funcionId || !butacasStr || !cantidad) {
        showNotification("Información de compra incompleta", "error");
        router.navigate(`/peliculas/${movieId}`);
        return;
    }

    purchaseData = {
        movieId: parseInt(movieId),
        funcionId: parseInt(funcionId),
        butacas: butacasStr.split(",").map((b) => parseInt(b)),
        cantidad: parseInt(cantidad),
        productos: [],
    };

    try {
        const [movie, funcion, products] = await Promise.all([
            api.getMovie(movieId),
            api.getFunction(funcionId),
            api.getProducts(),
        ]);

        // Store for quick updates
        currentMovie = movie;
        currentFunction = funcion;

        // Render summary
        renderSummary(movie, funcion);

        // Render products
        renderProducts(products);

        // Setup continue button
        const continueBtn = document.getElementById("continue-candy-btn");
        continueBtn.addEventListener("click", () => {
            processPurchase();
        });
    } catch (error) {
        console.error("Error loading data:", error);
        showNotification("Error al cargar los datos", "error");
    }
}

function renderSummary(movie, funcion) {
    const summaryContent = document.getElementById("summary-content");
    if (!summaryContent) return;

    const fechaHora = new Date(funcion.fechaHoraInicio);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaHoraOnly = new Date(fechaHora);
    fechaHoraOnly.setHours(0, 0, 0, 0);
    
    let fecha;
    if (fechaHoraOnly.getTime() === hoy.getTime()) {
        fecha = "Hoy";
    } else {
        const mañana = new Date(hoy);
        mañana.setDate(mañana.getDate() + 1);
        if (fechaHoraOnly.getTime() === mañana.getTime()) {
            fecha = "Mañana";
        } else {
            fecha = formatDate(fechaHora);
        }
    }
    const hora = formatTime(fechaHora.toISOString());

    const ticketsTotal = (funcion.precioBase || 0) * purchaseData.cantidad;
    const productsTotal = purchaseData.productos.reduce(
        (sum, p) => sum + p.precio * p.cantidad,
        0
    );
    const total = ticketsTotal + productsTotal;

    summaryContent.innerHTML = `
        <div class="mb-4">
            <img src="${movie.imagen}" alt="${sanitizeInput(movie.nombre)}" class="w-full h-48 object-cover rounded mb-3"/>
            <h3 class="font-bold text-lg mb-2">${sanitizeInput(movie.nombre)}</h3>
            <p class="text-sm text-gray-400 mb-4">2D · Castellano</p>
        </div>
        <div class="space-y-3 text-sm">
            <div>
                <span class="text-gray-400">Cine, día y horario:</span>
                <p class="font-semibold">${funcion.nombreSala || "Sala " + funcion.idSala}</p>
                <p class="text-gray-300">${fecha} · ${hora}</p>
            </div>
            <div>
                <span class="text-gray-400">Butacas:</span>
                <p class="font-semibold">${purchaseData.butacas.length} seleccionada(s)</p>
            </div>
            <div>
                <span class="text-gray-400">Entradas:</span>
                <p class="font-semibold">${purchaseData.cantidad} · ${formatCurrency(ticketsTotal)}</p>
            </div>
            <div id="products-summary" class="space-y-1">
                ${purchaseData.productos.length > 0
                    ? purchaseData.productos
                          .map(
                              (p) => `
                    <div class="flex justify-between text-sm">
                        <span>${sanitizeInput(p.nombre)} x${p.cantidad}</span>
                        <span>${formatCurrency(p.precio * p.cantidad)}</span>
                    </div>
                `
                          )
                          .join("")
                    : ""}
            </div>
            <div class="pt-4 border-t border-gray-700">
                <div class="flex justify-between items-center">
                    <span class="text-lg font-bold">Total:</span>
                    <span id="summary-total" class="text-xl font-bold text-cine-red">${formatCurrency(total)}</span>
                </div>
            </div>
        </div>
    `;
}

function renderProducts(products) {
    const container = document.getElementById("products-container");
    if (!container) return;

    if (products.length === 0) {
        container.innerHTML =
            '<div class="col-span-full text-center py-12 text-gray-400">No hay productos disponibles</div>';
        return;
    }

    container.innerHTML = products
        .map(
            (product) => {
                const cartItem = purchaseData.productos.find(
                    (p) => p.idProducto === product.idProducto
                );
                const quantity = cartItem ? cartItem.cantidad : 0;

                return `
            <div class="bg-cine-gray rounded-lg overflow-hidden">
                <div class="w-full h-48 bg-gray-700 flex items-center justify-center">
                    ${
                        product.imagen
                            ? `<img src="${product.imagen}" alt="${sanitizeInput(
                                  product.nombre
                              )}" class="w-full h-full object-cover"/>`
                            : `<span class="text-gray-400">Imagen</span>`
                    }
                </div>
                <div class="p-4">
                    <h3 class="text-lg font-bold mb-2">${sanitizeInput(
                        product.nombre || "Sin nombre"
                    )}</h3>
                    <p class="text-sm text-gray-400 mb-2 line-clamp-2">${sanitizeInput(
                        product.descripcion || ""
                    )}</p>
                    <div class="flex items-center justify-between">
                        <span class="text-xl font-bold text-cine-red">${formatCurrency(
                            product.precio || 0
                        )}</span>
                        <div class="flex items-center gap-2">
                            <button 
                                onclick="decreaseProduct(${product.idProducto})"
                                class="bg-gray-700 w-8 h-8 rounded flex items-center justify-center hover:bg-gray-600 transition"
                            >
                                <span class="text-white font-bold">-</span>
                            </button>
                            <span id="product-quantity-${product.idProducto}" class="w-8 text-center font-semibold">${quantity}</span>
                            <button 
                                onclick="increaseProduct(${product.idProducto}, '${sanitizeInput(product.nombre)}', ${product.precio})"
                                class="bg-cine-red w-8 h-8 rounded flex items-center justify-center hover:bg-red-700 transition"
                            >
                                <span class="text-white font-bold">+</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
            }
        )
        .join("");
}

// Global functions for product management
window.increaseProduct = function (productId, nombre, precio) {
    const existing = purchaseData.productos.find(
        (p) => p.idProducto === productId
    );
    if (existing) {
        existing.cantidad++;
    } else {
        purchaseData.productos.push({
            idProducto: productId,
            nombre: nombre,
            precio: precio,
            cantidad: 1,
        });
    }
    updateProductDisplay(productId);
    updateSummary();
};

window.decreaseProduct = function (productId) {
    const existing = purchaseData.productos.find(
        (p) => p.idProducto === productId
    );
    if (existing) {
        existing.cantidad--;
        if (existing.cantidad <= 0) {
            purchaseData.productos = purchaseData.productos.filter(
                (p) => p.idProducto !== productId
            );
        }
    }
    updateProductDisplay(productId);
    updateSummary();
};

function updateProductDisplay(productId) {
    const quantityEl = document.getElementById(`product-quantity-${productId}`);
    if (quantityEl) {
        const item = purchaseData.productos.find(
            (p) => p.idProducto === productId
        );
        quantityEl.textContent = item ? item.cantidad : 0;
    }
}

function updateSummary() {
    // Re-render summary with updated products
    if (currentMovie && currentFunction) {
        renderSummary(currentMovie, currentFunction);
    } else {
        api.getMovie(purchaseData.movieId).then((movie) => {
            currentMovie = movie;
            api.getFunction(purchaseData.funcionId).then((funcion) => {
                currentFunction = funcion;
                renderSummary(movie, funcion);
            });
        });
    }
}

async function processPurchase() {
    // Show processing modal
    const modal = document.getElementById("payment-processing-modal");
    if (modal) {
        modal.classList.remove("hidden");
    }

    try {
        // Prepare purchase data according to CompraInputDto structure
        const purchasePayload = {
            idFormaPago: 1, // Default payment method (you may want to make this selectable)
            butacas: purchaseData.butacas.map((idButaca) => ({
                idFuncion: purchaseData.funcionId,
                idButaca: idButaca,
            })),
            productos: purchaseData.productos.map((p) => ({
                idProducto: p.idProducto,
                cantidad: p.cantidad,
            })),
        };

        // Create purchase
        const result = await api.createPurchase(purchasePayload);

        // Hide processing modal
        if (modal) {
            modal.classList.add("hidden");
        }

        // Show success notification
        const successNotification = document.getElementById(
            "success-notification"
        );
        if (successNotification) {
            successNotification.classList.remove("hidden");
            setTimeout(() => {
                successNotification.classList.add("hidden");
                // Redirect to home or movies
                router.navigate("/peliculas");
            }, 5000);
        }
    } catch (error) {
        console.error("Error processing purchase:", error);
        if (modal) {
            modal.classList.add("hidden");
        }
        showNotification("Error al procesar la compra", "error");
    }
}

