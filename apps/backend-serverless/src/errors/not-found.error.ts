export class NotFoundError extends Error {
    constructor(resouce: string) {
        super(`Could not find resource: ${resouce}`);
        this.name = 'NotFoundError';
    }
}
