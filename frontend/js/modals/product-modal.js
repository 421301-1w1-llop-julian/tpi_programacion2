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
            Nombre: document.getElementById("product-nombre").value.trim(),
            Descripcion: document
                .getElementById("product-descripcion")
                .value.trim(),
            Precio: parseFloat(document.getElementById("product-precio").value),
            IdTipoProducto: parseInt(
                document.getElementById("product-tipo").value
            ),
            Imagen: document.getElementById("product-imagen")?.value.trim() || "",
        };

        const validation = validateForm(formData, {
            Nombre: { required: true, label: "Nombre" },
            Descripcion: { required: true, label: "Descripción" },
            Precio: {
                required: true,
                type: "decimal",
                min: 0,
                label: "Precio",
            },
            IdTipoProducto: {
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
                console.log("Updating product with ID:", productId, "Data:", formData);
                await api.updateProduct(productId, formData);
                showNotification(
                    "Producto actualizado exitosamente",
                    "success"
                );
            } else {
                console.log("Creating new product with data:", formData);
                await api.createProduct(formData);
                showNotification("Producto creado exitosamente", "success");
            }
            closeProductModal();
            // Recargar la lista de productos
            if (typeof loadProductsCRUD === 'function') {
                loadProductsCRUD();
            } else if (window.loadProductsCRUD) {
                window.loadProductsCRUD();
            }
        } catch (error) {
            console.error("Error saving product:", error);
            const errorMessage = error.message || "Error al guardar el producto";
            errorDiv.textContent = errorMessage;
            errorDiv.classList.remove("hidden");
            showNotification(errorMessage, "error");
        }
    });
}

// Global functions for products
window.showProductModal = async function (productId = null) {
    // Load modal only when needed (lazy loading)
    if (!document.getElementById("product-modal")) {
        await loadModal("product-modal.html");
    }
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
            console.log("Product data received:", product); // Debug
            document.getElementById("product-modal-title").textContent =
                "Editar Producto";
            document.getElementById("product-id").value = productId;
            document.getElementById("product-nombre").value =
                product.nombre || product.Nombre || "";
            document.getElementById("product-descripcion").value =
                product.descripcion || product.Descripcion || "";
            document.getElementById("product-precio").value =
                product.precio || product.Precio || "";
            const imagenInput = document.getElementById("product-imagen");
            if (imagenInput) {
                imagenInput.value = product.imagen || product.Imagen || "";
            }
            const idTipoProducto = product.idTipoProducto || product.IdTipoProducto;
            if (tipoSelect) tipoSelect.value = idTipoProducto || "";
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

