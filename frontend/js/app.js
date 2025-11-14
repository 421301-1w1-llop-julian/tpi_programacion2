// Main Application - Route Manager
// This file serves as the central router that connects all views

document.addEventListener("DOMContentLoaded", () => {
    // Register all routes with their respective view handlers
    router.register("/", "home.html", homeViewHandler);
    router.register("/login", "login.html", loginViewHandler);
    router.register("/register", "register.html", registerViewHandler);
    router.register("/peliculas", "movies.html", moviesViewHandler);
    router.register(
        "/peliculas/:id",
        "movie-detail.html",
        movieDetailViewHandler
    );
    router.register(
        "/pelicula/:id/compra_entradas/butacas",
        "movie-seats.html",
        movieSeatsViewHandler
    );
    router.register(
        "/pelicula/:id/compra_entradas/candy",
        "movie-candy.html",
        movieCandyViewHandler
    );
    router.register("/candy", "candy.html", candyViewHandler);
    router.register("/candy/:id", "candy-detail.html", candyDetailViewHandler);
    router.register("/comprar", "purchase.html", purchaseViewHandler);
    router.register("/dashboard", "dashboard.html", dashboardViewHandler);
    router.register("/dashboard/peliculas", "dashboard.html", () =>
        dashboardSectionViewHandler({ section: "peliculas" })
    );
    router.register("/dashboard/productos", "dashboard.html", () =>
        dashboardSectionViewHandler({ section: "productos" })
    );
    router.register("/dashboard/actores", "dashboard.html", () =>
        dashboardSectionViewHandler({ section: "actores" })
    );
    router.register("/dashboard/directores", "dashboard.html", () =>
        dashboardSectionViewHandler({ section: "directores" })
    );
    router.register("/dashboard/idiomas", "dashboard.html", () =>
        dashboardSectionViewHandler({ section: "idiomas" })
    );
    router.register("/dashboard/funciones", "dashboard.html", () =>
        dashboardSectionViewHandler({ section: "funciones" })
    );

    // Initialize router
    router.init();

    // Setup logout button (delegated event)
    document.addEventListener("click", (e) => {
        if (e.target.id === "logout-btn" || e.target.closest("#logout-btn")) {
            auth.logout();
            router.navigate("/");
        }
    });

    // Setup navigation links
    document.addEventListener("click", (e) => {
        const link = e.target.closest(".nav-link");
        if (link) {
            e.preventDefault();
            const href = link.getAttribute("href");
            if (href) {
                router.navigate(href.replace("#", ""));
            }
        }
    });
});
