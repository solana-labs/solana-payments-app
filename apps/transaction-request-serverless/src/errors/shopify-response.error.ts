export class ShopifyResponseError extends Error {
    constructor(type: string) {
        super(`Shopify response error: ${type}`);
        this.name = 'ShopifyResponseError';
        Object.setPrototypeOf(this, ShopifyResponseError.prototype);
    }
}
