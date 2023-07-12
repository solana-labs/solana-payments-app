export class ForbiddenError extends Error {
    constructor() {
        super();
        this.name = 'ForbiddenError';
    }
}
