// Purchase Handler
function purchaseViewHandler() {
    const container = document.getElementById("purchase-container");
    if (!container) return;

    if (!auth.isAuthenticated()) {
        showNotification("Debes iniciar sesión para comprar entradas", "error");
        router.navigate("/login");
        return;
    }

    container.innerHTML =
        '<p class="text-center text-gray-400">Proceso de compra (implementar con pasos)</p>';
}

