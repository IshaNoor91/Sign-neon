// ========================================
// PRODUCT DETAIL PAGE
// ========================================

const API_BASE = "https://vintage-artisans-production.up.railway.app/api";
const STORE = "signeon";
const CART_KEY = "signeonCart";

const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

const breadcrumbProduct = document.getElementById("breadcrumb-product");
const galleryMain = document.getElementById("gallery-main");
const galleryThumbs = document.getElementById("gallery-thumbs");
const pdCategory = document.getElementById("pd-category");
const pdTitle = document.getElementById("pd-title");
const pdSku = document.getElementById("pd-sku");
const pdAvailability = document.getElementById("pd-availability");
const pdPrice = document.getElementById("pd-price");
const pdDescription = document.getElementById("pd-description");
const qtyInput = document.getElementById("qty-input");
const qtyMinus = document.getElementById("qty-minus");
const qtyPlus = document.getElementById("qty-plus");
const addToCartBtn = document.getElementById("add-to-cart-btn");
const buyNowBtn = document.getElementById("buy-now-btn");
const relatedContainer = document.getElementById("related-products");

// ========================================
// LOAD PRODUCT
// ========================================

async function loadProduct() {
    if (!productId) {
        if (pdTitle) pdTitle.textContent = "Product not found";
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/products/${productId}?store=${STORE}`);
        const data = await response.json();

        if (!data.success || !data.product) throw new Error("Product not found");

        displayProduct(data.product);
        setupQuantity();
        setupAddToCart(data.product);
        loadRelatedProducts(data.product);

    } catch (error) {
        console.error("PRODUCT LOAD ERROR:", error);
        if (pdTitle) pdTitle.textContent = "Unable to load product";
    }
}

function displayProduct(product) {
    if (pdTitle) pdTitle.textContent = product.name;
    if (breadcrumbProduct) breadcrumbProduct.textContent = product.name;
    if (pdSku) pdSku.textContent = product.sku || "—";
    if (pdAvailability) pdAvailability.textContent = product.in_stock === false ? "Out of Stock" : "In Stock";

    // Price
    const regular = Number(product.regular_price || 0);
    const sale = Number(product.sale_price || 0);

    if (sale && regular && sale < regular) {
        const pct = Math.round((1 - sale / regular) * 100);
        pdPrice.innerHTML = `
            <span class="now">${formatPrice(sale, product.currency)}</span>
            <span class="old">${formatPrice(regular, product.currency)}</span>
            <span class="badge">-${pct}%</span>
        `;
    } else {
        pdPrice.innerHTML = `<span class="now">${formatPrice(regular || sale || null, product.currency)}</span>`;
    }

    // Gallery
    const images = product.images
        ? product.images.split(",").map(i => i.trim()).filter(Boolean)
        : [];

    if (images.length > 0) {
        galleryMain.innerHTML = `<img src="${images[0]}" alt="${product.name}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;">`;

        galleryThumbs.innerHTML = images.map((img, i) =>
            `<div class="${i === 0 ? "active" : ""}"><img src="${img}" alt="${product.name}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;"></div>`
        ).join("");

        galleryThumbs.querySelectorAll("div").forEach((thumb, i) => {
            thumb.addEventListener("click", () => {
                galleryMain.innerHTML = `<img src="${images[i]}" alt="${product.name}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;">`;
                galleryThumbs.querySelectorAll("div").forEach(t => t.classList.remove("active"));
                thumb.classList.add("active");
            });
        });
    }

    // Description — real HTML from the catalogue (tables, headings, etc.)
    if (pdDescription && (product.description || product.short_description)) {
        pdDescription.innerHTML = product.description || product.short_description;
    }

    // Category — "Parent>Child" names show just the last segment
    const categories = Array.isArray(product.categories) ? product.categories : [];
    if (categories.length > 0 && pdCategory) {
        const fullName = categories[categories.length - 1].name;
        pdCategory.textContent = fullName.split(">").map(p => p.trim()).pop();
    }

    // Enable add to cart / buy now
    [addToCartBtn, buyNowBtn].forEach(btn => {
        if (!btn) return;
        btn.disabled = false;
        btn.style.opacity = "";
        btn.style.cursor = "";
    });
}

// ========================================
// QUANTITY
// ========================================

function setupQuantity() {
    if (!qtyInput) return;
    qtyInput.value = 1;

    qtyMinus?.addEventListener("click", () => {
        let qty = Number(qtyInput.value);
        if (qty > 1) qtyInput.value = qty - 1;
    });

    qtyPlus?.addEventListener("click", () => {
        qtyInput.value = Number(qtyInput.value) + 1;
    });
}

// ========================================
// CART
// ========================================

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
    updateCartBadge();
}

function updateCartBadge() {
    const total = getCart().reduce((sum, item) => sum + Number(item.quantity || 0), 0);

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

function addProductToCart(product, quantity) {
    const cart = getCart();
    const existing = cart.find(item => Number(item.id) === Number(product.id));
    const price = Number(product.sale_price || product.regular_price || 0);
    const image = product.images ? product.images.split(",")[0].trim() : "";

    if (existing) {
        existing.quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price,
            currency: product.currency || "GBP",
            image,
            quantity
        });
    }

    saveCart(cart);
}

function setupAddToCart(product) {
    if (addToCartBtn) {
        addToCartBtn.addEventListener("click", () => {
            addProductToCart(product, Number(qtyInput?.value || 1));

            addToCartBtn.innerHTML = `<i class="fa-solid fa-check"></i> Added to Cart`;
            setTimeout(() => {
                addToCartBtn.innerHTML = `<i class="fa-solid fa-bag-shopping"></i> Add to Cart`;
            }, 1800);
        });
    }

    if (buyNowBtn) {
        buyNowBtn.addEventListener("click", () => {
            addProductToCart(product, Number(qtyInput?.value || 1));
            window.location.href = "checkout.html";
        });
    }
}

// ========================================
// RELATED PRODUCTS
// ========================================

async function loadRelatedProducts(product) {
    if (!relatedContainer) return;

    try {
        const categories = Array.isArray(product.categories) ? product.categories : [];
        if (categories.length === 0) return;

        const slug = categories[categories.length - 1].slug;
        const response = await fetch(`${API_BASE}/products/category/${slug}?store=${STORE}`);
        const data = await response.json();

        if (!data.success || !Array.isArray(data.products)) return;

        const related = data.products.filter(p => Number(p.id) !== Number(product.id)).slice(0, 4);
        if (related.length === 0) return;

        relatedContainer.innerHTML = related.map(p => {
            const image = p.images ? p.images.split(",")[0].trim() : "";
            const regular = Number(p.regular_price || 0);
            const sale = Number(p.sale_price || 0);
            const priceHTML = (sale && regular && sale < regular)
                ? `<span class="now">${formatPrice(sale, p.currency)}</span><span class="old">${formatPrice(regular, p.currency)}</span>`
                : `<span class="now">${formatPrice(regular || sale || null, p.currency)}</span>`;

            return `
                <a href="product.html?id=${p.id}" class="product-card">
                    <div class="product-thumb">
                        ${image ? `<img src="${image}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;">` : `<i class="fa-solid fa-image"></i>`}
                    </div>
                    <div class="product-info">
                        <h3>${p.name}</h3>
                        <div class="price">${priceHTML}</div>
                    </div>
                </a>
            `;
        }).join("");

    } catch (error) {
        console.error("RELATED PRODUCTS ERROR:", error);
    }
}

// ========================================
// START
// ========================================

updateCartBadge();
loadProduct();
