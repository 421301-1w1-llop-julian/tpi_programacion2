// Candy View Handler
async function candyViewHandler(routeParams, queryParams) {
    let products = [];
    let productTypes = [];

    try {
        // Load products and product types
        [products, productTypes] = await Promise.all([
            api.getProducts(),
            api.getProductTypes(),
        ]);
    } catch (error) {
        console.error("Error loading data:", error);
        document
            .getElementById("api-error-message")
            ?.classList.remove("hidden");
        return;
    }

    console.log(products);
    console.log(productTypes);

    // Populate product type filter
    const productTypeFilter = document.getElementById("product-type-filter");

    productTypes.forEach((type) => {
        const option = document.createElement("option");
        option.value = type.idTipoProducto;
        option.textContent = sanitizeInput(type.tipoProducto);
        productTypeFilter.appendChild(option);
    });

    // If there are query params, prefill the filter controls
    const sortFilter = document.getElementById("sort-filter");
    if (queryParams) {
        const qType = queryParams.get("TipoProductoId");
        const qPriceMin = queryParams.get("PrecioMin");
        const qPriceMax = queryParams.get("PrecioMax");
        const qSearch = queryParams.get("search");
        const qOrdenar = queryParams.get("ordenarPor");

        if (qType) productTypeFilter.value = qType;
        if (qPriceMin)
            document.getElementById("price-min-filter").value = qPriceMin;
        if (qPriceMax)
            document.getElementById("price-max-filter").value = qPriceMax;
        if (qSearch) document.getElementById("search-input").value = qSearch;
        if (qOrdenar && sortFilter) sortFilter.value = qOrdenar;
    }

    // Apply initial filters from URL params
    let filteredProducts = applyClientSideFilters(products, queryParams);
    renderProductsGrid(filteredProducts);

    // Search functionality: update URL with search param (debounced)
    const searchInput = document.getElementById("search-input");
    const searchDebounced = debounce((query) => {
        applyFilters();
    }, 600);

    searchInput.addEventListener("input", (e) => {
        searchDebounced(e.target.value);
    });

    // Filter functionality: when a filter changes, update the hash with search params
    function buildFiltersFromDOM() {
        const params = new URLSearchParams();
        const typeFilterVal = productTypeFilter.value;
        const priceMinVal = document.getElementById("price-min-filter").value;
        const priceMaxVal = document.getElementById("price-max-filter").value;
        const searchVal = document.getElementById("search-input").value;
        const sortVal = sortFilter ? sortFilter.value : "";

        if (typeFilterVal) params.append("TipoProductoId", typeFilterVal);
        if (priceMinVal) params.append("PrecioMin", priceMinVal);
        if (priceMaxVal) params.append("PrecioMax", priceMaxVal);
        if (searchVal && searchVal.length >= 2)
            params.append("search", searchVal);
        if (sortVal) params.append("ordenarPor", sortVal);

        return params;
    }

    function applyFilters() {
        const params = buildFiltersFromDOM();
        const hash = params.toString()
            ? `/candy?${params.toString()}`
            : "/candy";
        router.navigate(hash);
    }

    // Client-side filtering function
    function applyClientSideFilters(productsList, queryParams) {
        let filtered = [...productsList];

        if (!queryParams) return filtered;

        // Filter by search (product name)
        const search = queryParams.get("search");
        if (search && search.length >= 2) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter((product) =>
                product.nombre?.toLowerCase().includes(searchLower)
            );
        }

        // Filter by product type
        const tipoProductoId = queryParams.get("TipoProductoId");
        if (tipoProductoId) {
            filtered = filtered.filter(
                (product) => product.idTipoProducto === parseInt(tipoProductoId)
            );
        }
        //hola

        // Filter by minimum price
        const precioMin = queryParams.get("PrecioMin");
        if (precioMin) {
            filtered = filtered.filter(
                (product) => product.precio >= parseFloat(precioMin)
            );
        }

        // Filter by maximum price
        const precioMax = queryParams.get("PrecioMax");
        if (precioMax) {
            filtered = filtered.filter(
                (product) => product.precio <= parseFloat(precioMax)
            );
        }

        // Apply sorting
        const ordenarPor = queryParams.get("ordenarPor");
        if (ordenarPor) {
            switch (ordenarPor) {
                case "precio_asc":
                    filtered.sort((a, b) => (a.precio || 0) - (b.precio || 0));
                    break;
                case "precio_desc":
                    filtered.sort((a, b) => (b.precio || 0) - (a.precio || 0));
                    break;
                case "nombre_asc":
                    filtered.sort((a, b) => {
                        const nombreA = (a.nombre || "").toLowerCase();
                        const nombreB = (b.nombre || "").toLowerCase();
                        return nombreA.localeCompare(nombreB);
                    });
                    break;
                case "nombre_desc":
                    filtered.sort((a, b) => {
                        const nombreA = (a.nombre || "").toLowerCase();
                        const nombreB = (b.nombre || "").toLowerCase();
                        return nombreB.localeCompare(nombreA);
                    });
                    break;
            }
        }

        return filtered;
    }

    // Set up filter event listeners
    productTypeFilter.addEventListener("change", applyFilters);

    // Sort filter listener
    if (sortFilter) {
        sortFilter.addEventListener("change", applyFilters);
    }

    // Debounce price inputs
    const priceMinEl = document.getElementById("price-min-filter");
    const priceMaxEl = document.getElementById("price-max-filter");

    if (priceMinEl) {
        const priceMinDebounced = debounce(() => {
            applyFilters();
        }, 600);
        priceMinEl.addEventListener("input", priceMinDebounced);
    }

    if (priceMaxEl) {
        const priceMaxDebounced = debounce(() => {
            applyFilters();
        }, 600);
        priceMaxEl.addEventListener("input", priceMaxDebounced);
    }
}

function renderProductsGrid(products) {
    const grid = document.getElementById("products-grid");
    if (!grid) return;

    if (products.length === 0) {
        grid.innerHTML =
            '<div class="col-span-full text-center py-12 text-gray-400">No se encontraron productos</div>';
        return;
    }

    grid.innerHTML = products
        .map(
            (product) => `
            <div class="bg-cine-gray rounded-lg overflow-hidden hover:transform hover:scale-105 transition">
                <div class="w-full h-48 bg-gray-700 flex items-center justify-center cursor-pointer"
                     onclick="router.navigate('/candy/${product.idProducto}')">
                    ${
                        product.imagen
                            ? `<img src="${
                                  product.imagen
                              }" alt="${sanitizeInput(
                                  product.nombre
                              )}" class="w-full h-full object-cover"/>`
                            : `<span class="text-gray-400">Imagen</span>`
                    }
                </div>
                <div class="p-4">
                    <h3 class="text-lg font-bold mb-2 cursor-pointer"
                        onclick="router.navigate('/candy/${
                            product.idProducto
                        }')">
                        ${sanitizeInput(product.nombre || "Sin nombre")}
                    </h3>
                    <p class="text-sm text-gray-400 mb-2 line-clamp-2">${sanitizeInput(
                        product.descripcion || ""
                    )}</p>
                    <div class="flex items-center justify-between">
                        <span class="text-xl font-bold text-cine-red">${formatCurrency(
                            product.precio || 0
                        )}</span>
                        <button onclick="addToCart(${product.idProducto})" 
                                class="bg-cine-red w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-700 transition">
                            <span class="text-white font-bold">+</span>
                        </button>
                    </div>
                </div>
            </div>
        `
        )
        .join("");
}
