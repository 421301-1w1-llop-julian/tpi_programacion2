// Movie Seats Handler
let selectedSeats = [];
let ticketQuantity = 1;
let unitPrice = 0;
let currentSeatsFunction = null;
let currentSeatsMovie = null;
let currentSeatsData = []; // Store seats data to avoid re-fetching

async function movieSeatsViewHandler(params, queryParams) {
    const movieId = params.id;
    const funcionId = queryParams?.get("funcion");

    if (!funcionId) {
        showNotification("Debes seleccionar una función primero", "error");
        router.navigate(`/peliculas/${movieId}`);
        return;
    }
    //

    try {
        const [movie, funcion, seats] = await Promise.all([
            api.getMovie(movieId),
            api.getFunction(funcionId),
            api.getSeats(funcionId),
        ]);

        currentSeatsMovie = movie;
        currentSeatsFunction = funcion;
        currentSeatsData = seats; // Store seats data
        seatsContainerListenerAttached = false; // Reset listener flag
        unitPrice = funcion.precioBase || 0;
        ticketQuantity = 1; // Reset quantity
        selectedSeats = []; // Reset selected seats

        // Render summary
        renderSummary(movie, funcion);

        // Initialize price display
        updateTotalPrice();

        // Setup ticket quantity controls
        const quantityInput = document.getElementById("ticket-quantity");
        const decreaseBtn = document.getElementById("quantity-decrease");
        const increaseBtn = document.getElementById("quantity-increase");

        const applyQuantityChange = () => {
            if (quantityInput) {
                quantityInput.value = ticketQuantity;
            }

            // If current selection exceeds new quantity, trim the selection
            if (selectedSeats.length > ticketQuantity) {
                while (selectedSeats.length > ticketQuantity) {
                    const removedSeat = selectedSeats.pop();
                    if (window.selectedSeatsInfo) {
                        delete window.selectedSeatsInfo[removedSeat];
                    }
                }
            }

            renderSeats(seats);
            renderSummary(movie, funcion);
            updateSeatsDisplay();
            updateTotalPrice();
            updateQuantityButtonsState();
            updateContinueButton();
        };

        if (quantityInput) {
            quantityInput.value = ticketQuantity;
        }
        updateQuantityButtonsState();

        if (decreaseBtn) {
            decreaseBtn.addEventListener("click", () => {
                if (ticketQuantity > 1) {
                    ticketQuantity--;
                    applyQuantityChange();
                }
            });
        }

        if (increaseBtn) {
            increaseBtn.addEventListener("click", () => {
                if (ticketQuantity < 10) {
                    ticketQuantity++;
                    applyQuantityChange();
                }
            });
        }

        // Render seats
        renderSeats(seats);

        // Setup continue button
        const continueBtn = document.getElementById("continue-seats-btn");
        continueBtn.addEventListener("click", () => {
            if (selectedSeats.length === ticketQuantity && ticketQuantity > 0) {
                router.navigate(
                    `/pelicula/${movieId}/compra_entradas/candy?funcion=${funcionId}&butacas=${selectedSeats.join(
                        ","
                    )}&cantidad=${ticketQuantity}`
                );
            }
        });
    } catch (error) {
        console.error("Error loading seats:", error);
        document.getElementById("seats-container").innerHTML = `
            <div class="bg-red-900 bg-opacity-50 border border-red-500 rounded p-4">
                <p>Error al cargar las butacas: ${error.message}</p>
            </div>
        `;
    }
}

function renderSummary(movie, funcion) {
    const summaryContent = document.getElementById("summary-content");
    if (!summaryContent) return;

    const fechaHora = new Date(funcion.fechaHoraInicio);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaHoraOnly = new Date(fechaHora);
    fechaHoraOnly.setHours(0, 0, 0, 0);

    let fecha;
    if (fechaHoraOnly.getTime() === hoy.getTime()) {
        fecha = "Hoy";
    } else {
        const mañana = new Date(hoy);
        mañana.setDate(mañana.getDate() + 1);
        if (fechaHoraOnly.getTime() === mañana.getTime()) {
            fecha = "Mañana";
        } else {
            fecha = formatDate(fechaHora);
        }
    }
    const hora = formatTime(fechaHora.toISOString());
    const total = unitPrice * ticketQuantity;

    summaryContent.innerHTML = `
        <div class="mb-4">
            <img src="${movie.imagen}" alt="${sanitizeInput(
        movie.nombre
    )}" class="w-full h-48 object-cover rounded mb-3"/>
            <h3 class="font-bold text-lg mb-2">${sanitizeInput(
                movie.nombre
            )}</h3>
            <p class="text-sm text-gray-400 mb-4">2D · Castellano</p>
        </div>
        <div class="space-y-3 text-sm">
            <div>
                <span class="text-gray-400">Cine, día y horario:</span>
                <p class="font-semibold">${
                    funcion.nombreSala || "Sala " + funcion.idSala
                }</p>
                <p class="text-gray-300">${fecha} · ${hora}</p>
            </div>
            <div>
                <span class="text-gray-400">Butacas:</span>
                <p id="selected-seats-display" class="font-semibold">-</p>
            </div>
            <div>
                <span class="text-gray-400">Entradas:</span>
                <p id="tickets-display" class="font-semibold">${ticketQuantity} · ${formatCurrency(
        total
    )}</p>
            </div>
            <div class="pt-4 border-t border-gray-700">
                <div class="flex justify-between items-center">
                    <span class="text-lg font-bold">Total:</span>
                    <span id="summary-total" class="text-xl font-bold text-cine-red">${formatCurrency(
                        total
                    )}</span>
                </div>
            </div>
        </div>
    `;
}

// Store seats container reference and ensure single event listener
let seatsContainerListenerAttached = false;

function renderSeats(seats) {
    const container = document.getElementById("seats-container");
    if (!container) return;
    
    // Attach event listener only once using event delegation
    if (!seatsContainerListenerAttached) {
        container.addEventListener("click", (e) => {
            const button = e.target.closest("button[data-seat-action='toggle']");
            if (button && !button.disabled) {
                const seatId = parseInt(button.dataset.seatId);
                const row = button.dataset.seatRow;
                const number = parseInt(button.dataset.seatNumber);
                toggleSeat(seatId, row, number);
            }
        });
        seatsContainerListenerAttached = true;
    }

    // Group seats by row
    // Seats may come as ButacasFuncion objects with IdButacaNavigation
    const seatsByRow = {};
    seats.forEach((seat) => {
        // Handle both direct Butaca objects and ButacasFuncion objects
        const butaca = seat.idButacaNavigation || seat;
        const row = butaca.fila || seat.fila || "A";
        const idButaca = butaca.idButaca || seat.idButaca;
        const numeroButaca = butaca.numeroButaca || seat.numeroButaca;
        const idEstadoButaca =
            seat.idEstadoButaca ||
            (seat.idEstadoButacaNavigation
                ? seat.idEstadoButacaNavigation.idEstadoButaca
                : 1);
        const idTipoButaca = butaca.idTipoButaca || seat.idTipoButaca;

        if (!seatsByRow[row]) {
            seatsByRow[row] = [];
        }
        seatsByRow[row].push({
            idButaca: idButaca,
            numeroButaca: numeroButaca,
            fila: row,
            idEstadoButaca: idEstadoButaca,
            idTipoButaca: idTipoButaca,
        });
    });

    // Sort rows alphabetically
    const sortedRows = Object.keys(seatsByRow).sort();

    container.innerHTML = `
        <div class="flex flex-col items-center gap-2">
            ${sortedRows
                .map((row) => {
                    const rowSeats = seatsByRow[row].sort(
                        (a, b) => a.numeroButaca - b.numeroButaca
                    );
                    return `
                    <div class="flex items-center gap-2">
                        <span class="w-8 text-center font-semibold">${row}</span>
                        <div class="flex gap-1">
                            ${rowSeats
                                .map((seat) => {
                                    const isSelected = selectedSeats.includes(
                                        seat.idButaca
                                    );
                                    const isOccupied =
                                        seat.idEstadoButaca !== 1; // Assuming 1 = available
                                    const isAccessible =
                                        seat.idTipoButaca === 2; // Assuming 2 = accessible

                                    let seatClass =
                                        "w-8 h-8 rounded flex items-center justify-center text-xs font-semibold cursor-pointer transition";
                                    let seatContent = seat.numeroButaca;

                                    if (isSelected) {
                                        seatClass +=
                                            " bg-cine-red border-2 border-red-600 text-white";
                                    } else if (isOccupied) {
                                        seatClass +=
                                            " bg-gray-800 border border-gray-700 text-gray-600 cursor-not-allowed";
                                        seatContent = "X";
                                    } else if (isAccessible) {
                                        seatClass +=
                                            " bg-blue-600 border border-blue-500 text-white";
                                    } else {
                                        seatClass +=
                                            " bg-gray-600 border border-gray-500 text-white hover:bg-gray-500";
                                    }

                                    return `
                                        <button
                                            class="${seatClass}"
                                            data-seat-id="${seat.idButaca}"
                                            data-seat-row="${row}"
                                            data-seat-number="${
                                                seat.numeroButaca
                                            }"
                                            ${isOccupied ? "disabled" : ""}
                                            data-seat-action="toggle"
                                        >
                                            ${seatContent}
                                        </button>
                                    `;
                                })
                                .join("")}
                        </div>
                    </div>
                `;
                })
                .join("")}
        </div>
    `;
}

// Global function for seat selection
window.toggleSeat = function (seatId, row, number) {
    console.log("toggleSeat called:", { seatId, row, number, currentSelected: selectedSeats.length, ticketQuantity });
    
    if (selectedSeats.includes(seatId)) {
        selectedSeats = selectedSeats.filter((id) => id !== seatId);
        // Remove from seat info
        if (window.selectedSeatsInfo) {
            delete window.selectedSeatsInfo[seatId];
        }
        console.log("Seat deselected. New count:", selectedSeats.length);
    } else {
        if (selectedSeats.length >= ticketQuantity) {
            showNotification(
                `Solo puedes seleccionar ${ticketQuantity} butaca(s)`,
                "error"
            );
            return;
        }
        selectedSeats.push(seatId);
        // Store seat info
        if (!window.selectedSeatsInfo) {
            window.selectedSeatsInfo = {};
        }
        window.selectedSeatsInfo[seatId] = { fila: row, numero: number };
        console.log("Seat selected. New count:", selectedSeats.length);
    }

    // Re-render seats to update visual state (use cached seats data)
    if (currentSeatsData.length > 0) {
        renderSeats(currentSeatsData);
    }

    // Update summary immediately when seat is selected/deselected
    updateSeatsDisplay();
    updateTotalPrice();
    
    // Re-render summary to ensure all information is up to date
    if (currentSeatsMovie && currentSeatsFunction) {
        renderSummary(currentSeatsMovie, currentSeatsFunction);
        // After re-rendering, update the seats display again since renderSummary recreates the element
        updateSeatsDisplay();
        updateTotalPrice();
    }
    
    // Update continue button immediately (no need for setTimeout since we're not doing async operations)
    console.log("About to call updateContinueButton. State:", {
        selectedSeats: selectedSeats.length,
        ticketQuantity,
        shouldEnable: selectedSeats.length === ticketQuantity && ticketQuantity > 0 && selectedSeats.length > 0
    });
    updateContinueButton();
};

function updateSeatsDisplay() {
    const display = document.getElementById("selected-seats-display");
    if (display) {
        if (selectedSeats.length === 0) {
            display.textContent = "-";
        } else {
            // Store seat info when selecting
            const seatInfo = window.selectedSeatsInfo || {};
            const seatDetails = selectedSeats
                .map((id) => {
                    const info = seatInfo[id];
                    if (info) {
                        return `${info.fila}${info.numero}`;
                    }
                    return `Butaca ${id}`;
                })
                .join(", ");
            display.textContent = seatDetails;
        }
    }
}

function updateTotalPrice() {
    const total = unitPrice * ticketQuantity;
    const totalPriceEl = document.getElementById("total-price");
    const summaryTotalEl = document.getElementById("summary-total");
    const ticketsDisplayEl = document.getElementById("tickets-display");

    if (totalPriceEl) {
        totalPriceEl.textContent = formatCurrency(total);
    }
    if (summaryTotalEl) {
        summaryTotalEl.textContent = formatCurrency(total);
    }
    if (ticketsDisplayEl) {
        ticketsDisplayEl.textContent = `${ticketQuantity} · ${formatCurrency(
            total
        )}`;
    }

    const unitPriceEl = document.getElementById("unit-price");
    if (unitPriceEl) {
        unitPriceEl.textContent = formatCurrency(unitPrice);
    }
}

function updateQuantityButtonsState() {
    const decreaseBtn = document.getElementById("quantity-decrease");
    const increaseBtn = document.getElementById("quantity-increase");

    if (decreaseBtn) {
        decreaseBtn.disabled = ticketQuantity <= 1;
    }
    if (increaseBtn) {
        increaseBtn.disabled = ticketQuantity >= 10;
    }
}

function updateContinueButton() {
    const continueBtn = document.getElementById("continue-seats-btn");
    if (!continueBtn) {
        console.warn("Continue button not found in updateContinueButton");
        return;
    }

    const shouldEnable = 
        selectedSeats.length === ticketQuantity &&
        ticketQuantity > 0 &&
        selectedSeats.length > 0;

    console.log("updateContinueButton called:", {
        selectedSeats: selectedSeats.length,
        ticketQuantity,
        shouldEnable
    });

    if (shouldEnable) {
        continueBtn.disabled = false;
        continueBtn.removeAttribute("disabled");
        continueBtn.classList.remove(
            "bg-gray-600",
            "text-gray-400",
            "cursor-not-allowed"
        );
        continueBtn.classList.add(
            "bg-cine-red",
            "text-white",
            "hover:bg-red-700",
            "cursor-pointer"
        );
        console.log("Button enabled");
    } else {
        continueBtn.disabled = true;
        continueBtn.setAttribute("disabled", "disabled");
        continueBtn.classList.remove(
            "bg-cine-red",
            "text-white",
            "hover:bg-red-700",
            "cursor-pointer"
        );
        continueBtn.classList.add(
            "bg-gray-600",
            "text-gray-400",
            "cursor-not-allowed"
        );
        console.log("Button disabled");
    }
}
