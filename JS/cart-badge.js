/* ============================================
   CART BADGE
   Updates the little count badge on the cart icon in the header.
   Wrapped in an IIFE so it's safe to include on any page — including
   ones that already define their own cart variables (product.js,
   cart.js) — without naming collisions.

   Include on pages that DON'T already call updateCartCount()
   themselves: index.html, shop.html.
============================================ */

(function () {

    const CART_STORAGE_KEY = "signeonCart";

    function readCart() {
        try {
            const cart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY));
            return Array.isArray(cart) ? cart : [];
        } catch {
            return [];
        }
    }

    function updateBadge() {
        const total = readCart().reduce(
            (sum, item) => sum + Number(item.quantity || 0),
            0
        );

        document.querySelectorAll(".fa-bag-shopping").forEach(icon => {
            const link = icon.closest("a");
            if (!link) return;

            let badge = link.querySelector(".cart-count");

            if (total > 0) {
                if (!badge) {
                    badge = document.createElement("span");
                    badge.className = "cart-count";
                    link.appendChild(badge);
                }
                badge.textContent = total;
            } else if (badge) {
                badge.remove();
            }
        });
    }

    document.addEventListener("DOMContentLoaded", updateBadge);
})();
