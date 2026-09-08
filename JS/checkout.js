// ========================================
// CHECKOUT PAGE
// ========================================

const CART_KEY = "signeonCart";
const API_BASE = "https://vintage-artisans-production.up.railway.app/api";
const STORE = "signeon";

const container = document.getElementById("checkout-container");

// Shipping countries + payment methods are configured from the shared
// Admin panel (Admin -> Shipping Countries / Payment Methods) — never
// hardcoded here. Stripe is left out for now (checkout.html doesn't
// load stripe.js yet); every other enabled method works as-is.
async function loadShippingCountries() {
    try {
        const response = await fetch(`${API_BASE}/shipping-countries`);
        const data = await response.json();
        if (data.success && data.countries.length > 0) return data.countries;
    } catch (error) {
        console.error("Failed to load shipping countries:", error);
    }
    return [{ name: "United Kingdom", code: "GB" }];
}

async function loadPaymentMethods() {
    try {
        const response = await fetch(`${API_BASE}/payment-methods`);
        const data = await response.json();
        if (data.success && data.methods.length > 0) {
            return data.methods.filter(m => m.key !== "stripe");
        }
    } catch (error) {
        console.error("Failed to load payment methods:", error);
    }
    return [{ key: "cod", label: "Cash on Delivery", country_only: null }];
}

function getCart() {
    try {
        const cart = JSON.parse(localStorage.getItem(CART_KEY));
        return Array.isArray(cart) ? cart : [];
    } catch {
        return [];
    }
}

function clearCart() {
    localStorage.removeItem(CART_KEY);
}

function paymentPanelHTML(key) {
    if (key === "bank_transfer") {
        return `
            <div id="payment-panel-bank_transfer" class="payment-panel" style="display:none;margin-top:14px;">
                <p style="font-size:13px;color:var(--gray);margin-bottom:10px;">Please transfer the total amount, then enter your transaction/reference ID below. We'll confirm your order once the payment is verified.</p>
                <div class="form-group">
                    <label>Transaction / Reference ID</label>
                    <input type="text" id="transaction-ref" name="transactionRef">
                </div>
            </div>
        `;
    }
    return "";
}

function renderCheckout(countries, paymentMethods) {
    const cart = getCart();

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="empty-cart">
                <i class="fa-solid fa-bag-shopping"></i>
                <h2>Your cart is empty</h2>
                <p>Add some neon signs to your cart before checking out.</p>
                <a href="shop.html" class="btn btn-neon">Continue Shopping</a>
            </div>
        `;
        return;
    }

    let subtotal = 0;
    const cartCurrency = cart[0]?.currency || "GBP";

    const summaryRows = cart.map(item => {
        const price = Number(item.price || 0);
        const quantity = Number(item.quantity || 1);
        subtotal += price * quantity;
        return `<div class="summary-row"><span>${item.name} × ${quantity}</span><span>${formatPrice(price * quantity, item.currency)}</span></div>`;
    }).join("");

    const paymentOptionsHTML = paymentMethods.map((method, index) => `
        <label class="payment-option" id="payment-option-${method.key}" ${method.country_only ? `data-country-only="${method.country_only}"` : ""}>
            <input type="radio" name="paymentMethod" value="${method.key}"${index === 0 ? " checked" : ""}>
            <span>${method.label}</span>
        </label>
    `).join("");

    const paymentPanelsHTML = paymentMethods.map(m => paymentPanelHTML(m.key)).join("");

    container.innerHTML = `
        <div class="checkout-grid">
            <form class="checkout-form" id="checkout-form">
                <h2 class="checkout-section-title">Contact Details</h2>
                <div class="form-group">
                    <label>Email Address</label>
                    <input type="email" id="email" name="email" required>
                </div>
                <div class="form-group">
                    <label>Phone Number</label>
                    <input type="tel" id="phone" name="phone" required>
                </div>

                <h2 class="checkout-section-title">Shipping Address</h2>
                <div class="form-group">
                    <label>Full Name</label>
                    <input type="text" id="full-name" name="fullName" required>
                </div>
                <div class="form-group">
                    <label>Address</label>
                    <input type="text" id="address" name="address" required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>City</label>
                        <input type="text" id="city" name="city" required>
                    </div>
                    <div class="form-group">
                        <label>Postcode</label>
                        <input type="text" id="postal-code" name="postalCode">
                    </div>
                </div>
                <div class="form-group">
                    <label>Country</label>
                    <select id="country" name="country" required>
                        ${countries.map(c => `<option value="${c.name}">${c.name}</option>`).join("")}
                    </select>
                </div>
                <div class="form-group">
                    <label>Order Notes (optional)</label>
                    <textarea id="notes" name="notes" rows="3" placeholder="Notes about your order, e.g. custom text or colour"></textarea>
                </div>

                <h2 class="checkout-section-title">Payment Method</h2>
                <div class="payment-options">
                    ${paymentOptionsHTML}
                </div>
                ${paymentPanelsHTML}

                <div id="checkout-error" style="color:#c0392b;font-size:13px;margin-top:14px;"></div>

                <button type="submit" class="btn btn-neon btn-block" id="place-order-btn" style="margin-top:20px;">Place Order</button>
            </form>

            <aside class="order-summary">
                <h3>Order Summary</h3>
                ${summaryRows}
                <div class="summary-row total"><span>Total</span><span class="now">${formatPrice(subtotal, cartCurrency)}</span></div>
                <a href="cart.html" class="btn btn-outline btn-block" style="margin-top:16px;">← Back to Cart</a>
            </aside>
        </div>
    `;

    document.getElementById("checkout-form").addEventListener("submit", handleSubmit);
    document.querySelectorAll('input[name="paymentMethod"]').forEach(r => r.addEventListener("change", updatePaymentUI));
    document.getElementById("country").addEventListener("change", updatePaymentMethodVisibility);

    updatePaymentMethodVisibility();
}

function updatePaymentMethodVisibility() {
    const countrySelect = document.getElementById("country");
    if (!countrySelect) return;
    const selectedCountry = countrySelect.value;

    document.querySelectorAll(".payment-option[data-country-only]").forEach(option => {
        const isAllowed = option.dataset.countryOnly === selectedCountry;
        option.hidden = !isAllowed;

        const radio = option.querySelector('input[type="radio"]');
        if (!isAllowed && radio && radio.checked) {
            radio.checked = false;
            const fallback = document.querySelector(".payment-option:not([hidden]) input[type=radio]");
            if (fallback) fallback.checked = true;
        }
    });

    updatePaymentUI();
}

function getSelectedPaymentMethod() {
    const checked = document.querySelector('input[name="paymentMethod"]:checked');
    return checked ? checked.value : "cod";
}

function updatePaymentUI() {
    const method = getSelectedPaymentMethod();
    document.querySelectorAll(".payment-panel").forEach(panel => {
        panel.style.display = panel.id === `payment-panel-${method}` ? "block" : "none";
    });
}

async function handleSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const submitButton = document.getElementById("place-order-btn");
    const errorBox = document.getElementById("checkout-error");
    errorBox.textContent = "";

    const paymentMethod = getSelectedPaymentMethod();

    if (paymentMethod === "bank_transfer" && !form.transactionRef.value.trim()) {
        errorBox.textContent = "Please enter your transaction/reference ID.";
        return;
    }

    const cart = getCart();
    const subtotal = cart.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0);
    const cartCurrency = cart[0]?.currency || "GBP";

    const payload = {
        store: STORE,
        customer: {
            fullName: form.fullName.value.trim(),
            email: form.email.value.trim(),
            phone: form.phone.value.trim(),
            address: form.address.value.trim(),
            city: form.city.value.trim(),
            postalCode: form.postalCode.value.trim(),
            country: form.country.value,
            notes: form.notes.value.trim()
        },
        items: cart.map(item => ({
            productId: item.id,
            name: item.name,
            price: Number(item.price || 0),
            quantity: Number(item.quantity || 1)
        })),
        subtotal,
        total: subtotal,
        currency: cartCurrency,
        paymentMethod
    };

    if (paymentMethod === "bank_transfer") {
        payload.paymentReference = form.transactionRef.value.trim();
    }

    submitButton.disabled = true;
    submitButton.textContent = "Placing order...";

    try {
        const response = await fetch(`${API_BASE}/orders`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
            throw new Error(data.message || "Failed to place order");
        }

        clearCart();
        renderConfirmation(data.orderId);

    } catch (error) {
        console.error("ORDER SUBMIT ERROR:", error);
        errorBox.textContent = error.message || "Something went wrong placing your order. Please try again.";
        submitButton.disabled = false;
        submitButton.textContent = "Place Order";
    }
}

function renderConfirmation(orderId) {
    container.innerHTML = `
        <div class="empty-cart">
            <i class="fa-solid fa-circle-check" style="color:var(--neon-dark);"></i>
            <h2>Order placed!</h2>
            <p>Thanks for your order${orderId ? ` — reference #${orderId}` : ""}. We'll be in touch to confirm delivery.</p>
            <a href="shop.html" class="btn btn-neon">Continue Shopping</a>
        </div>
    `;
}

async function init() {
    const [countries, paymentMethods] = await Promise.all([loadShippingCountries(), loadPaymentMethods()]);
    renderCheckout(countries, paymentMethods);
}

init();
