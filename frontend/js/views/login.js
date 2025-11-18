// Login View Handler
function loginViewHandler() {
    const form = document.getElementById("login-form");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const errorDiv = document.getElementById("login-error");
        errorDiv.classList.add("hidden");

        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value;

        if (!username || !password) {
            errorDiv.textContent = "Por favor completa todos los campos";
            errorDiv.classList.remove("hidden");
            return;
        }

        try {
            const response = await api.login({ username, password });
            auth.setUser(response.user, response.token);
            showNotification("Sesión iniciada correctamente", "success");
            router.navigate("/");
        } catch (error) {
            errorDiv.textContent = error.message;
            errorDiv.classList.remove("hidden");
        }
    });
}

