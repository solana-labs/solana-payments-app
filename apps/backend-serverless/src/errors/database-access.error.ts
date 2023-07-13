export class DatabaseAccessError extends Error {
    constructor(recordName: string) {
        super(`Issue with record: ${recordName}`);
        this.name = 'DatabaseAccessError';
    }
}
