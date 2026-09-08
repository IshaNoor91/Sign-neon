// ========================================
// CART PAGE
// ========================================

const CART_KEY = "signeonCart";
const cartContainer = document.getElementById("cart-container");

function getCart() {
    try {
        const cart = JSON.parse(localStorage.getItem(CART_KEY));
        return Array.isArray(cart) ? cart : [];
    } catch {
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function renderCart() {
    const cart = getCart();

    if (cart.length === 0) {
        cartContainer.innerHTML = `
            <div class="empty-cart">
                <i class="fa-solid fa-bag-shopping"></i>
                <h2>Your cart is empty</h2>
                <p>Looks like you haven't added any neon signs yet. Start exploring our collection.</p>
                <a href="shop.html" class="btn btn-neon">Continue Shopping</a>
            </div>
        `;
        return;
    }

    let subtotal = 0;
    const cartCurrency = cart[0]?.currency || "GBP";

    const rows = cart.map((item, index) => {
        const price = Number(item.price || 0);
        const quantity = Number(item.quantity || 1);
        const lineTotal = price * quantity;
        subtotal += lineTotal;

        return `
            <tr data-index="${index}">
                <td style="display:flex;align-items:center;gap:14px;">
                    <div style="width:56px;height:56px;border-radius:8px;background:var(--light);display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0;">
                        ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width:100%;height:100%;object-fit:cover;">` : `<i class="fa-solid fa-image" style="color:#c2c2c2;"></i>`}
                    </div>
                    <span>${item.name}</span>
                </td>
                <td>${formatPrice(price, item.currency)}</td>
                <td>
                    <div class="qty-box" style="display:inline-flex;">
                        <button type="button" class="cart-minus" data-index="${index}">−</button>
                        <input type="text" class="cart-qty-input" data-index="${index}" value="${quantity}" readonly style="width:40px;">
                        <button type="button" class="cart-plus" data-index="${index}">+</button>
                    </div>
                </td>
                <td>${formatPrice(lineTotal, item.currency)}</td>
                <td><button type="button" class="cart-remove" data-index="${index}" aria-label="Remove"><i class="fa-solid fa-trash" style="color:var(--gray);"></i></button></td>
            </tr>
        `;
    }).join("");

    cartContainer.innerHTML = `
        <div class="checkout-grid">
            <div style="overflow-x:auto;">
                <table class="cart-table">
                    <thead>
                        <tr><th>Product</th><th>Price</th><th>Qty</th><th>Subtotal</th><th></th></tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
            <aside class="order-summary">
                <h3>Cart Summary</h3>
                <div class="summary-row"><span>Subtotal</span><span>${formatPrice(subtotal, cartCurrency)}</span></div>
                <div class="summary-row"><span>Shipping</span><span>Calculated at checkout</span></div>
                <div class="summary-row total"><span>Total</span><span class="now">${formatPrice(subtotal, cartCurrency)}</span></div>
                <a href="checkout.html" class="btn btn-neon btn-block" style="margin-top:16px;">Proceed to Checkout</a>
                <a href="shop.html" class="btn btn-outline btn-block" style="margin-top:10px;">Continue Shopping</a>
            </aside>
        </div>
    `;

    setupCartEvents();
}

function setupCartEvents() {
    cartContainer.querySelectorAll(".cart-plus").forEach(btn => {
        btn.addEventListener("click", () => {
            const cart = getCart();
            cart[Number(btn.dataset.index)].quantity++;
            saveCart(cart);
            renderCart();
        });
    });

    cartContainer.querySelectorAll(".cart-minus").forEach(btn => {
        btn.addEventListener("click", () => {
            const cart = getCart();
            const index = Number(btn.dataset.index);
            if (cart[index].quantity > 1) cart[index].quantity--;
            saveCart(cart);
            renderCart();
        });
    });

    cartContainer.querySelectorAll(".cart-remove").forEach(btn => {
        btn.addEventListener("click", () => {
            const cart = getCart();
            cart.splice(Number(btn.dataset.index), 1);
            saveCart(cart);
            renderCart();
        });
    });
}

renderCart();
