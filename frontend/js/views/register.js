// Register View Handler
function registerViewHandler() {
    const form = document.getElementById("register-form");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const errorDiv = document.getElementById("register-error");
        errorDiv.classList.add("hidden");

        const formData = {
            username: document.getElementById("reg-username").value.trim(),
            password: document.getElementById("reg-password").value,
            nombre: document.getElementById("reg-nombre").value.trim(),
            apellido: document.getElementById("reg-apellido").value.trim(),
            email: document.getElementById("reg-email").value.trim(),
            idTipoUsuario: 2,
        };

        const validation = validateForm(formData, {
            username: { required: true, minLength: 3, label: "Usuario" },
            password: { required: true, minLength: 6, label: "Contraseña" },
            nombre: { required: true, label: "Nombre" },
            apellido: { required: true, label: "Apellido" },
            email: { required: true, email: true, label: "Email" },
        });

        if (!validation.isValid) {
            errorDiv.textContent = Object.values(validation.errors)[0];
            errorDiv.classList.remove("hidden");
            return;
        }

        try {
            await api.register(formData);
            showNotification(
                "Registro exitoso. Por favor inicia sesión",
                "success"
            );
            router.navigate("/login");
        } catch (error) {
            errorDiv.textContent = error.message;
            errorDiv.classList.remove("hidden");
        }
    });
}

