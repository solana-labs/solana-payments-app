export class UnauthorizedRequestError extends Error {
    constructor(reason: string) {
        super(`Unauthorized Request Reason: ${reason}`);
        this.name = 'UnauthorizedRequestError';
        Object.setPrototypeOf(this, UnauthorizedRequestError.prototype);
    }
}
