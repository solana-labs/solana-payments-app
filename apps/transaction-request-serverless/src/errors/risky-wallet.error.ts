export class RiskyWalletError extends Error {
    constructor() {
        super(`Wallet is not safe to tranansaction with`);
        this.name = 'RiskyWalletError';
    }
}
