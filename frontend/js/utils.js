// Utility Functions

// Sanitize input to prevent XSS
function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

// Validate email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Validate form data
function validateForm(formData, rules) {
    const errors = {};
    
    for (const field in rules) {
        const value = formData[field];
        const rule = rules[field];

        // Check if required - handle different value types
        if (rule.required) {
            if (value === null || value === undefined) {
                errors[field] = `${rule.label || field} es requerido`;
                continue;
            }
            // For strings, check if empty after trim
            if (typeof value === 'string' && value.trim() === '') {
                errors[field] = `${rule.label || field} es requerido`;
                continue;
            }
            // For arrays, check if empty
            if (Array.isArray(value) && value.length === 0) {
                errors[field] = `${rule.label || field} es requerido`;
                continue;
            }
            // For numbers, check if NaN (but don't check min here, that's done below)
            if (typeof value === 'number' && isNaN(value)) {
                errors[field] = `${rule.label || field} es requerido`;
                continue;
            }
        }

        // Only apply string length validations to strings
        if (value && typeof value === 'string' && rule.minLength && value.length < rule.minLength) {
            errors[field] = `${rule.label || field} debe tener al menos ${rule.minLength} caracteres`;
            continue;
        }

        if (value && typeof value === 'string' && rule.maxLength && value.length > rule.maxLength) {
            errors[field] = `${rule.label || field} no puede exceder ${rule.maxLength} caracteres`;
            continue;
        }

        if (value && rule.email && !validateEmail(value)) {
            errors[field] = `${rule.label || field} debe ser un email válido`;
            continue;
        }

        if (value && rule.pattern && !rule.pattern.test(value)) {
            errors[field] = rule.message || `${rule.label || field} tiene un formato inválido`;
            continue;
        }

        if (value && rule.type === 'number') {
            const num = Number(value);
            if (isNaN(num)) {
                errors[field] = `${rule.label || field} debe ser un número`;
                continue;
            }
            if (rule.min !== undefined && num < rule.min) {
                errors[field] = `${rule.label || field} debe ser mayor o igual a ${rule.min}`;
                continue;
            }
            if (rule.max !== undefined && num > rule.max) {
                errors[field] = `${rule.label || field} debe ser menor o igual a ${rule.max}`;
                continue;
            }
        }

        if (value && rule.type === 'decimal') {
            const num = parseFloat(value);
            if (isNaN(num)) {
                errors[field] = `${rule.label || field} debe ser un número decimal`;
                continue;
            }
            if (rule.min !== undefined && num < rule.min) {
                errors[field] = `${rule.label || field} debe ser mayor o igual a ${rule.min}`;
                continue;
            }
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}

// Format date
function formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('es-AR');
}

// Format datetime
function formatDateTime(dateTime) {
    if (!dateTime) return '';
    const d = new Date(dateTime);
    return d.toLocaleString('es-AR');
}

// Format time (HH:mm)
function formatTime(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS'
    }).format(amount);
}

// Format duration (minutes to hours and minutes)
function formatDuration(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-20 right-4 z-50 px-6 py-4 rounded-lg shadow-lg ${
        type === 'error' ? 'bg-red-600' :
        type === 'success' ? 'bg-green-600' :
        'bg-blue-600'
    } text-white`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Cart management
const cart = {
    get() {
        const cartStr = localStorage.getItem('cart');
        return cartStr ? JSON.parse(cartStr) : { products: [], seats: [] };
    },

    addProduct(productId, quantity = 1) {
        const cart = this.get();
        const existing = cart.products.find(p => p.id === productId);
        if (existing) {
            existing.quantity += quantity;
        } else {
            cart.products.push({ id: productId, quantity });
        }
        localStorage.setItem('cart', JSON.stringify(cart));
    },

    removeProduct(productId) {
        const cart = this.get();
        cart.products = cart.products.filter(p => p.id !== productId);
        localStorage.setItem('cart', JSON.stringify(cart));
    },

    updateProductQuantity(productId, quantity) {
        const cart = this.get();
        const product = cart.products.find(p => p.id === productId);
        if (product) {
            product.quantity = quantity;
            if (quantity <= 0) {
                this.removeProduct(productId);
            } else {
                localStorage.setItem('cart', JSON.stringify(cart));
            }
        }
    },

    setSeats(seats) {
        const cart = this.get();
        cart.seats = seats;
        localStorage.setItem('cart', JSON.stringify(cart));
    },

    clear() {
        localStorage.removeItem('cart');
    },

    getTotal(productsData) {
        const cart = this.get();
        let total = 0;
        cart.products.forEach(item => {
            const product = productsData.find(p => p.idProducto === item.id);
            if (product) {
                total += product.precio * item.quantity;
            }
        });
        return total;
    }
};

