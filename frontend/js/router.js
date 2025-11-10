// Simple Router Implementation
const router = {
    routes: {},
    currentRoute: null,
    // Compute viewPath at runtime from the current document path so fetch requests
    // correctly target the views folder even when the app is served under a sub-path
    // (for example: /TPI/frontend/). This avoids incorrect requests to /views/....
    viewPath: (function () {
        try {
            const pathname = window.location.pathname || "/";
            const base = pathname.endsWith("/")
                ? pathname
                : pathname.substring(0, pathname.lastIndexOf("/") + 1);
            return base + "views/";
        } catch (e) {
            return "./views/";
        }
    })(),

    init() {
        // Handle hash changes
        window.addEventListener("hashchange", () => this.handleRoute());
        // Handle initial load
        this.handleRoute();
    },

    register(path, viewFile, handler = null) {
        this.routes[path] = { viewFile, handler };
    },

    navigate(path) {
        window.location.hash = path;
    },

    matchRoute(routePath, actualPath) {
        const routeParts = routePath.split("/");
        const actualParts = actualPath.split("/");

        if (routeParts.length !== actualParts.length) {
            return null;
        }

        const params = {};
        for (let i = 0; i < routeParts.length; i++) {
            if (routeParts[i].startsWith(":")) {
                const paramName = routeParts[i].slice(1);
                params[paramName] = actualParts[i];
            } else if (routeParts[i] !== actualParts[i]) {
                return null;
            }
        }
        return params;
    },

    async loadView(viewFile) {
        try {
            const url = this.viewPath + viewFile;
            console.log("[router] fetching view url:", url);
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to load view: ${viewFile}`);
            }
            return await response.text();
        } catch (error) {
            console.error("Error loading view:", error);
            return `
                <div class="container mx-auto px-4 py-8">
                    <div class="bg-red-900 bg-opacity-50 border border-red-500 rounded p-4">
                        <h2 class="text-xl font-bold mb-2">Error</h2>
                        <p>No se pudo cargar la vista: ${viewFile}</p>
                    </div>
                </div>
            `;
        }
    },

    updateActiveNavLink() {
        const currentPath = window.location.hash.slice(1) || "/";
        document.querySelectorAll(".nav-link").forEach((link) => {
            const href = link.getAttribute("href");
            if (href) {
                const linkPath = href.replace("#", "");
                if (
                    linkPath === currentPath ||
                    (linkPath !== "/" && currentPath.startsWith(linkPath))
                ) {
                    link.classList.add("text-cine-red");
                    link.classList.remove("text-white");
                } else {
                    link.classList.remove("text-cine-red");
                    link.classList.add("text-white");
                }
            }
        });
    },

    async handleRoute() {
        try {
            const hash = window.location.hash.slice(1) || "/";
            const path = hash.split("?")[0];
            const queryParams = new URLSearchParams(
                window.location.hash.split("?")[1] || ""
            );

            // Update active nav link
            this.updateActiveNavLink();

            // Find matching route
            let matchedRoute = null;
            let routeParams = {};

            for (const routePath in this.routes) {
                const params = this.matchRoute(routePath, path);
                if (params !== null) {
                    matchedRoute = routePath;
                    routeParams = params;
                    break;
                }
            }

            if (matchedRoute) {
                this.currentRoute = path;
                const app = document.getElementById("app");
                app.innerHTML =
                    '<div class="flex justify-center items-center min-h-screen"><div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cine-red"></div></div>';

                try {
                    const route = this.routes[matchedRoute];
                    const html = await this.loadView(route.viewFile);
                    app.innerHTML = html;

                    // Call handler if provided
                    if (route.handler) {
                        // Esperar un momento para asegurar que el DOM esté listo
                        await new Promise((resolve) => setTimeout(resolve, 50));
                        await route.handler(routeParams, queryParams);
                    }
                } catch (error) {
                    console.error("Route error:", error);
                    app.innerHTML = `
                    <div class="container mx-auto px-4 py-8">
                        <div class="bg-red-900 bg-opacity-50 border border-red-500 rounded p-4">
                            <h2 class="text-xl font-bold mb-2">Error</h2>
                            <p>${sanitizeInput(error.message)}</p>
                        </div>
                    </div>
                `;
                }
            } else {
                document.getElementById("app").innerHTML = `
                <div class="container mx-auto px-4 py-8">
                    <h1 class="text-3xl font-bold mb-4">404 - Página no encontrada</h1>
                    <a href="#/" class="text-cine-red hover:underline">Volver al inicio</a>
                </div>
            `;
            }
        } catch (error) {
            console.error("Router error:", error);
            const app = document.getElementById("app");
            if (app) {
                app.innerHTML = `
                    <div class="container mx-auto px-4 py-8">
                        <div class="bg-red-900 bg-opacity-50 border border-red-500 rounded p-4">
                            <h2 class="text-xl font-bold mb-2">Error</h2>
                            <p>${sanitizeInput(error.message)}</p>
                        </div>
                    </div>
                `;
            }
        }
    },
};
