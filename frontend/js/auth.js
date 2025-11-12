// Authentication Management
const auth = {
    isAuthenticated() {
        return !!localStorage.getItem('token');
    },

    isAdmin() {
        const user = this.getUser();
        return user && user.idTipoUsuario === 1;
    },

    getUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    getUserId() {
        const user = this.getUser();
        return user ? user.idUsuario || user.id : null;
    },

    setUser(user, token) {
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', token);
        this.updateUI();
    },

    logout() {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        this.updateUI();
        router.navigate('/');
    },

    updateUI() {
        const navbar = document.getElementById('navbar');
        const userMenu = document.getElementById('user-menu');
        const authButtons = document.getElementById('auth-buttons');
        const usernameDisplay = document.getElementById('username-display');
        const dashboardLink = document.getElementById('dashboard-link');

        // La navbar siempre está visible
        if (navbar) navbar.classList.remove('hidden');

        if (this.isAuthenticated()) {
            if (userMenu) userMenu.classList.remove('hidden');
            if (authButtons) authButtons.classList.add('hidden');
            const user = this.getUser();
            if (user && usernameDisplay) {
                usernameDisplay.textContent = user.username || user.nombre || 'Usuario';
            }

            if (this.isAdmin() && dashboardLink) {
                dashboardLink.classList.remove('hidden');
            } else if (dashboardLink) {
                dashboardLink.classList.add('hidden');
            }
        } else {
            if (userMenu) userMenu.classList.add('hidden');
            if (authButtons) authButtons.classList.remove('hidden');
            if (dashboardLink) dashboardLink.classList.add('hidden');
        }
    }
};

// Initialize auth UI on load
document.addEventListener('DOMContentLoaded', () => {
    auth.updateUI();
});

