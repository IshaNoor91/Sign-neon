// ========================================
// SHOP PAGE — product grid, filters, sort, pagination.
// Talks to the same shared backend as Vintage Artisans, always scoped
// to the Signeon store via ?store=signeon.
// ========================================

const container = document.getElementById("products-container");

const API_BASE = "https://vintage-artisans-production.up.railway.app/api";
const STORE = "signeon";

const productsPerPage = 24;

let currentPage = 1;
let totalPages = 1;

const categoryFilterList = document.getElementById("category-filter-list");
const priceMinInput = document.getElementById("price-min-input");
const priceMaxInput = document.getElementById("price-max-input");
const applyPriceBtn = document.getElementById("apply-price-btn");
const clearFiltersBtn = document.getElementById("clear-filters-btn");
const sortSelect = document.getElementById("sort-select");
const resultsCount = document.getElementById("results-count");

const filtersSidebar = document.getElementById("filters-sidebar");
const filtersBackdrop = document.getElementById("filters-backdrop");
const filtersClose = document.getElementById("filters-close");
const mobileFilterToggle = document.getElementById("mobile-filter-toggle");

const filterState = {
    category: null,
    minPrice: null,
    maxPrice: null,
    sort: "default"
};

// ========================================
// CATEGORY FILTER LIST
// ========================================

function loadCategoryFilterList() {
    if (!categoryFilterList) return;

    fetch(`${API_BASE}/categories?store=${STORE}`)
        .then(response => response.json())
        .then(data => {
            if (!data.success) return;
            renderCategoryFilterList(data.categories);
        })
        .catch(error => console.error("CATEGORIES API ERROR:", error));
}

function renderCategoryFilterList(categories) {
    categoryFilterList.innerHTML = "";

    if (categories.length === 0) {
        categoryFilterList.innerHTML = `<li style="color:var(--gray);font-size:13px;">No categories yet.</li>`;
        return;
    }

    categories.forEach(cat => {
        const displayName = cat.name.split(">").map(p => p.trim()).pop();
        const li = document.createElement("li");
        li.innerHTML = `
            <label title="${cat.name.replace(/>/g, " > ")}">
                <span><input type="checkbox" data-slug="${cat.slug}"> ${displayName}</span>
            </label>
        `;
        li.querySelector("input").addEventListener("change", (e) => {
            categoryFilterList.querySelectorAll("input[type=checkbox]").forEach(cb => {
                if (cb !== e.target) cb.checked = false;
            });
            filterState.category = e.target.checked ? cat.slug : null;
            loadProducts(1);
            closeMobileFilters();
        });
        categoryFilterList.appendChild(li);
    });
}

// ========================================
// LOAD PRODUCTS
// ========================================

function loadProducts(page = 1) {
    if (!container) return;

    currentPage = page;
    container.innerHTML = `<div class="empty-state"><i class="fa-solid fa-bolt"></i><h3>Loading...</h3></div>`;

    const query = new URLSearchParams();
    query.set("store", STORE);
    query.set("page", page);
    query.set("limit", productsPerPage);

    if (filterState.category) query.set("category", filterState.category);
    if (filterState.minPrice !== null) query.set("minPrice", filterState.minPrice);
    if (filterState.maxPrice !== null) query.set("maxPrice", filterState.maxPrice);
    if (filterState.sort && filterState.sort !== "default") query.set("sort", filterState.sort);

    fetch(`${API_BASE}/products?${query.toString()}`)
        .then(response => {
            if (!response.ok) throw new Error("Failed to fetch products");
            return response.json();
        })
        .then(data => {
            if (!data.success) throw new Error("Products API returned an error");

            totalPages = data.totalPages;

            if (resultsCount) {
                resultsCount.textContent = `${data.total} product${data.total === 1 ? "" : "s"}`;
            }

            displayProducts(data.products);
            renderPagination();
        })
        .catch(error => {
            console.error("Error loading shop products:", error);
            container.innerHTML = `<div class="empty-state"><i class="fa-solid fa-triangle-exclamation"></i><h3>Unable to load products</h3></div>`;
        });
}

// ========================================
// DISPLAY PRODUCTS
// ========================================

function displayProducts(products) {
    if (!products || products.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-bolt"></i>
                <h3>No products found</h3>
                <p>Try a different category or price range.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = products.map(product => {
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
}

// ========================================
// PAGINATION
// ========================================

function renderPagination() {
    let pagination = document.getElementById("pagination");

    if (!pagination) {
        pagination = document.createElement("div");
        pagination.id = "pagination";
        pagination.className = "pagination";
        container.parentElement.appendChild(pagination);
    }

    if (totalPages <= 1) {
        pagination.innerHTML = "";
        return;
    }

    let html = `<button id="prev-btn" ${currentPage === 1 ? "disabled" : ""}>‹</button>`;

    for (let page = 1; page <= totalPages; page++) {
        html += `<button class="${page === currentPage ? "active" : ""}" data-page="${page}">${page}</button>`;
    }

    html += `<button id="next-btn" ${currentPage === totalPages ? "disabled" : ""}>›</button>`;

    pagination.innerHTML = html;

    pagination.querySelectorAll("[data-page]").forEach(button => {
        button.addEventListener("click", function () {
            loadProducts(Number(this.dataset.page));
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    });

    const nextButton = document.getElementById("next-btn");
    if (nextButton) nextButton.addEventListener("click", () => {
        if (currentPage < totalPages) {
            loadProducts(currentPage + 1);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    });

    const prevButton = document.getElementById("prev-btn");
    if (prevButton) prevButton.addEventListener("click", () => {
        if (currentPage > 1) {
            loadProducts(currentPage - 1);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    });
}

// ========================================
// SORT / PRICE FILTER / MOBILE DRAWER
// ========================================

if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
        filterState.sort = e.target.value;
        loadProducts(1);
    });
}

if (applyPriceBtn) {
    applyPriceBtn.addEventListener("click", () => {
        filterState.minPrice = priceMinInput.value !== "" ? Number(priceMinInput.value) : null;
        filterState.maxPrice = priceMaxInput.value !== "" ? Number(priceMaxInput.value) : null;
        loadProducts(1);
        closeMobileFilters();
    });
}

if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener("click", () => {
        filterState.category = null;
        filterState.minPrice = null;
        filterState.maxPrice = null;
        filterState.sort = "default";

        if (priceMinInput) priceMinInput.value = "";
        if (priceMaxInput) priceMaxInput.value = "";
        if (sortSelect) sortSelect.value = "default";
        if (categoryFilterList) {
            categoryFilterList.querySelectorAll("input[type=checkbox]").forEach(cb => cb.checked = false);
        }

        loadProducts(1);
        closeMobileFilters();
    });
}

function openMobileFilters() {
    filtersSidebar?.classList.add("open");
    filtersBackdrop?.classList.add("show");
}

function closeMobileFilters() {
    filtersSidebar?.classList.remove("open");
    filtersBackdrop?.classList.remove("show");
}

mobileFilterToggle?.addEventListener("click", openMobileFilters);
filtersClose?.addEventListener("click", closeMobileFilters);
filtersBackdrop?.addEventListener("click", closeMobileFilters);

// ========================================
// INITIAL LOAD
// ========================================

loadCategoryFilterList();
loadProducts(1);
