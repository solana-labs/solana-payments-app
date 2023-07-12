export class MissingExpectedDatabaseRecordError extends Error {
    constructor(databaseRecordName: string) {
        super(`Missing expected database record: ${databaseRecordName}`);
        this.name = 'MissingExpectedDatabaseRecordError';
    }
}
