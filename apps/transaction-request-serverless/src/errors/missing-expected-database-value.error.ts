export class MissingExpectedDatabaseValueError extends Error {
    constructor(databaseValueName: string) {
        super(`Missing expected database value: ${databaseValueName}`);
        this.name = 'MissingExpectedDatabaseValueError';
        Object.setPrototypeOf(this, MissingExpectedDatabaseValueError.prototype);
    }
}
