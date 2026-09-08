// ========================================
// PRICE FORMATTING — shared by every page that shows a price.
// The backend resolves each product's price + currency based on the
// visitor's detected country (see backend/pricing.js): a manual
// override if the admin set one, otherwise a live currency conversion
// from the PKR base price, otherwise plain PKR. This helper just
// displays whatever price/currency the API already sent — no
// conversion happens in the browser.
// ========================================

function formatPrice(amount, currency) {

    if (amount === null || amount === undefined || amount === "") {
        return "Price unavailable";
    }

    const number = Number(amount);
    const code = (currency || "GBP").toUpperCase();

    try {
        return new Intl.NumberFormat(undefined, {
            style: "currency",
            currency: code
        }).format(number);
    } catch (error) {
        return `${code} ${number.toFixed(2)}`;
    }

}
