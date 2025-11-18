// Dashboard Utility Functions

function initDashboardMobileMenu() {
    const toggle = document.getElementById("mobile-menu-toggle");
    const menu = document.getElementById("mobile-menu");

    if (toggle && menu) {
        // Remove existing listeners
        const newToggle = toggle.cloneNode(true);
        toggle.parentNode.replaceChild(newToggle, toggle);

        newToggle.addEventListener("click", (e) => {
            e.stopPropagation();
            menu.classList.toggle("hidden");
        });

        // Close menu when clicking outside
        document.addEventListener("click", (e) => {
            if (!menu.contains(e.target) && !newToggle.contains(e.target)) {
                menu.classList.add("hidden");
            }
        });
    }
}

function updateDashboardNavLinks(activePath) {
    document.querySelectorAll(".dashboard-nav-link").forEach((link) => {
        const href = link.getAttribute("href");
        if (href && href.replace("#", "") === activePath) {
            link.classList.add("bg-gray-800", "text-cine-red");
            link.classList.remove("text-white");
        } else {
            link.classList.remove("bg-gray-800", "text-cine-red");
            link.classList.add("text-white");
        }
    });
}

// Generic pagination function for CRUD tables
window.renderPagination = function(paginaActual, totalPaginas, totalRegistros, onPageChange) {
    if (totalPaginas <= 1 && paginaActual === 1) {
        return ""; // No mostrar paginación si solo hay una página
    }

    return `
        <div class="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
            <div class="text-sm text-gray-400">
                Página ${paginaActual} de ${totalPaginas} ${totalRegistros ? `(${totalRegistros} registros)` : ''}
            </div>
            <div class="flex gap-2">
                <button 
                    onclick="${onPageChange}(${Math.max(1, paginaActual - 1)})"
                    ${paginaActual <= 1 ? 'disabled' : ''}
                    class="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 transition text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    ${paginaActual <= 1 ? 'style="pointer-events: none;"' : ''}
                >
                    Anterior
                </button>
                <button 
                    onclick="${onPageChange}(${Math.min(totalPaginas, paginaActual + 1)})"
                    ${paginaActual >= totalPaginas ? 'disabled' : ''}
                    class="px-4 py-2 bg-cine-red rounded hover:bg-red-700 transition text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    ${paginaActual >= totalPaginas ? 'style="pointer-events: none;"' : ''}
                >
                    Siguiente
                </button>
            </div>
        </div>
    `;
};

// Helper function to paginate data on client side
window.paginateData = function(data, pagina, tamañoPagina = 10) {
    const inicio = (pagina - 1) * tamañoPagina;
    const fin = inicio + tamañoPagina;
    const datosPaginados = data.slice(inicio, fin);
    const totalPaginas = Math.ceil(data.length / tamañoPagina);
    
    return {
        datos: datosPaginados,
        paginaActual: pagina,
        totalPaginas: totalPaginas,
        totalRegistros: data.length,
        tamañoPagina: tamañoPagina
    };
};

