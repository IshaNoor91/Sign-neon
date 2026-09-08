// ========================================
// HOME PAGE — featured products strip.
// Shows real featured products for the Signeon store once any exist;
// otherwise leaves the static "coming soon" placeholder already in the
// page untouched.
// ========================================

(function () {
    const container = document.getElementById("featured-products");
    if (!container) return;

    const API_BASE = "https://vintage-artisans-production.up.railway.app/api";

    fetch(`${API_BASE}/products?store=signeon&featured=true&limit=8`)
        .then(response => response.json())
        .then(data => {
            if (!data.success || !Array.isArray(data.products) || data.products.length === 0) return;

            container.innerHTML = data.products.map(product => {
                const image = product.images ? product.images.split(",")[0].trim() : "";
                const hasSale = product.sale_price && product.regular_price &&
                    Number(product.sale_price) < Number(product.regular_price);

                const priceHTML = hasSale
                    ? `<span class="now">${formatPrice(product.sale_price, product.currency)}</span>
                       <span class="old">${formatPrice(product.regular_price, product.currency)}</span>`
                    : `<span class="now">${formatPrice(product.regular_price || product.sale_price, product.currency)}</span>`;

                const badge = hasSale ? `<span class="product-badge">Sale</span>` : "";

                return `
                    <a href="product.html?id=${product.id}" class="product-card">
                        <div class="product-thumb">
                            ${badge}
                            ${image ? `<img src="${image}" alt="${product.name}" loading="lazy" style="width:100%;height:100%;object-fit:cover;">` : `<i class="fa-solid fa-image"></i>`}
                        </div>
                        <div class="product-info">
                            <h3>${product.name}</h3>
                            <div class="price">${priceHTML}</div>
                        </div>
                    </a>
                `;
            }).join("");
        })
        .catch(error => console.error("Featured products error:", error));
})();
