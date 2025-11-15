// Modal Loader Utility
let movieModalInitialized = false;
let productModalInitialized = false;
let actorModalInitialized = false;

// Compute modalPath at runtime from the current document path (same logic as router)
const modalPath = (function () {
    try {
        const pathname = window.location.pathname || "/";
        const base = pathname.endsWith("/")
            ? pathname
            : pathname.substring(0, pathname.lastIndexOf("/") + 1);
        return base + "pages/modals/";
    } catch (e) {
        return "./pages/modals/";
    }
})();

async function loadModal(modalFile) {
    const modalId = modalFile.replace(".html", "");
    if (document.getElementById(modalId)) return; // Already loaded

    try {
        // Use the same path calculation logic as the router
        const response = await fetch(modalPath + modalFile);
        if (!response.ok) {
            throw new Error(`Failed to load modal: ${response.status}`);
        }
        const html = await response.text();
        document.body.insertAdjacentHTML("beforeend", html);

        if (modalId === "movie-modal" && !movieModalInitialized) {
            initMovieModal();
            movieModalInitialized = true;
        } else if (modalId === "product-modal" && !productModalInitialized) {
            initProductModal();
            productModalInitialized = true;
        } else if (modalId === "actor-modal" && !actorModalInitialized) {
            initActorModal();
            actorModalInitialized = true;
        }
    } catch (error) {
        console.error("Error loading modal:", error);
    }
}

// Close modals when clicking outside
document.addEventListener("click", (e) => {
    const movieModal = document.getElementById("movie-modal");
    const productModal = document.getElementById("product-modal");
    const actorModal = document.getElementById("actor-modal");

    if (movieModal && e.target === movieModal) {
        closeMovieModal();
    }
    if (productModal && e.target === productModal) {
        closeProductModal();
    }
    if (actorModal && e.target === actorModal) {
        closeActorModal();
    }
});

