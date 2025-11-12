// Dashboard Utility Functions

function initDashboardMobileMenu() {
    const toggle = document.getElementById("mobile-menu-toggle");
    const menu = document.getElementById("mobile-menu");

    if (toggle && menu) {
        // Remove existing listeners
        const newToggle = toggle.cloneNode(true);
        toggle.parentNode.replaceChild(newToggle, toggle);

        newToggle.addEventListener("click", (e) => {
            e.stopPropagation();
            menu.classList.toggle("hidden");
        });

        // Close menu when clicking outside
        document.addEventListener("click", (e) => {
            if (!menu.contains(e.target) && !newToggle.contains(e.target)) {
                menu.classList.add("hidden");
            }
        });
    }
}

function updateDashboardNavLinks(activePath) {
    document.querySelectorAll(".dashboard-nav-link").forEach((link) => {
        const href = link.getAttribute("href");
        if (href && href.replace("#", "") === activePath) {
            link.classList.add("bg-gray-800", "text-cine-red");
            link.classList.remove("text-white");
        } else {
            link.classList.remove("bg-gray-800", "text-cine-red");
            link.classList.add("text-white");
        }
    });
}

