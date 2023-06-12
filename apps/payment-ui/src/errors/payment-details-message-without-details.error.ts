export class PaymentDetailsMessageWithoutDetailsError extends Error {
    constructor() {
        super();
        this.name = 'PaymentDetailsMessageWithoutDetailsError';
    }
}
