// Simple Router Implementation
const router = {
    routes: {},
    currentRoute: null,

    init() {
        // Handle hash changes
        window.addEventListener('hashchange', () => this.handleRoute());
        // Handle initial load
        this.handleRoute();
    },

    register(path, handler) {
        this.routes[path] = handler;
    },

    navigate(path) {
        window.location.hash = path;
    },

    matchRoute(routePath, actualPath) {
        const routeParts = routePath.split('/');
        const actualParts = actualPath.split('/');
        
        if (routeParts.length !== actualParts.length) {
            return null;
        }

        const params = {};
        for (let i = 0; i < routeParts.length; i++) {
            if (routeParts[i].startsWith(':')) {
                const paramName = routeParts[i].slice(1);
                params[paramName] = actualParts[i];
            } else if (routeParts[i] !== actualParts[i]) {
                return null;
            }
        }
        return params;
    },

    async handleRoute() {
        const hash = window.location.hash.slice(1) || '/';
        const path = hash.split('?')[0];
        const queryParams = new URLSearchParams(window.location.hash.split('?')[1] || '');

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
            const app = document.getElementById('app');
            app.innerHTML = '<div class="flex justify-center items-center min-h-screen"><div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cine-red"></div></div>';
            
            try {
                await this.routes[matchedRoute](routeParams, queryParams);
            } catch (error) {
                console.error('Route error:', error);
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
            document.getElementById('app').innerHTML = `
                <div class="container mx-auto px-4 py-8">
                    <h1 class="text-3xl font-bold mb-4">404 - Página no encontrada</h1>
                    <a href="#/" class="text-cine-red hover:underline">Volver al inicio</a>
                </div>
            `;
        }
    }
};

