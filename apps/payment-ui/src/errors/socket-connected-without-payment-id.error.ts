export class SocketConnectedWithoutPaymentIdError extends Error {
    constructor() {
        super();
        this.name = 'SocketConnectedWithoutPaymentIdError';
    }
}
