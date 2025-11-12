// Modal Loader Utility
let movieModalInitialized = false;
let productModalInitialized = false;
let actorModalInitialized = false;

async function loadModal(modalFile) {
    const modalId = modalFile.replace(".html", "");
    if (document.getElementById(modalId)) return; // Already loaded

    try {
        const response = await fetch(`/views/modals/${modalFile}`);
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

