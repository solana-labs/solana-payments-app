export class InvalidInputError extends Error {
    constructor(envName: string) {
        super(`Invalid input error: ${envName}`);
        this.name = 'InvalidInputError';
    }
}
