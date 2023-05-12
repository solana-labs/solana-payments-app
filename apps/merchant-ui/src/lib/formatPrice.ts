export const formatPrice = (() => {
    if (typeof window === 'undefined') {
        return (price: number) => price.toFixed(2);
    }

    const formatter = new Intl.NumberFormat('en', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    return (price: number) => formatter.format(price);
})();
