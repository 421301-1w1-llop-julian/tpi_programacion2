// Product Modal Functions
function initProductModal() {
    const form = document.getElementById("product-form");
    if (!form) return;

    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);

    newForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const errorDiv = document.getElementById("product-form-error");
        errorDiv.classList.add("hidden");

        const productId = document.getElementById("product-id").value;
        const formData = {
            nombre: document.getElementById("product-nombre").value.trim(),
            descripcion: document
                .getElementById("product-descripcion")
                .value.trim(),
            precio: parseFloat(document.getElementById("product-precio").value),
            idTipoProducto: parseInt(
                document.getElementById("product-tipo").value
            ),
        };

        const validation = validateForm(formData, {
            nombre: { required: true, label: "Nombre" },
            descripcion: { required: true, label: "Descripción" },
            precio: {
                required: true,
                type: "decimal",
                min: 0,
                label: "Precio",
            },
            idTipoProducto: {
                required: true,
                type: "number",
                label: "Tipo de Producto",
            },
        });

        if (!validation.isValid) {
            errorDiv.textContent = Object.values(validation.errors)[0];
            errorDiv.classList.remove("hidden");
            return;
        }

        try {
            if (productId) {
                await api.updateProduct(productId, formData);
                showNotification(
                    "Producto actualizado exitosamente",
                    "success"
                );
            } else {
                await api.createProduct(formData);
                showNotification("Producto creado exitosamente", "success");
            }
            closeProductModal();
            loadProductsCRUD();
        } catch (error) {
            errorDiv.textContent = error.message;
            errorDiv.classList.remove("hidden");
        }
    });
}

// Global functions for products
window.showProductModal = async function (productId = null) {
    await loadModal("product-modal.html");
    const modal = document.getElementById("product-modal");
    if (!modal) return;

    try {
        // Load product types
        const productTypes = await api.getProductTypes();
        const tipoSelect = document.getElementById("product-tipo");
        if (tipoSelect) {
            tipoSelect.innerHTML =
                '<option value="">Seleccionar...</option>' +
                productTypes
                    .map(
                        (t) =>
                            `<option value="${t.idTipoProducto}">${sanitizeInput(
                                t.nombre
                            )}</option>`
                    )
                    .join("");
        }

        if (productId) {
            const product = await api.getProduct(productId);
            document.getElementById("product-modal-title").textContent =
                "Editar Producto";
            document.getElementById("product-id").value = productId;
            document.getElementById("product-nombre").value =
                product.nombre || "";
            document.getElementById("product-descripcion").value =
                product.descripcion || "";
            document.getElementById("product-precio").value =
                product.precio || "";
            if (tipoSelect) tipoSelect.value = product.idTipoProducto || "";
        } else {
            document.getElementById("product-modal-title").textContent =
                "Agregar Producto";
            document.getElementById("product-form").reset();
            document.getElementById("product-id").value = "";
        }
    } catch (error) {
        console.error("Error loading modal data:", error);
    }

    modal.classList.remove("hidden");
};

window.closeProductModal = function () {
    const modal = document.getElementById("product-modal");
    if (modal) {
        modal.classList.add("hidden");
        document.getElementById("product-form")?.reset();
    }
};

