export class MissingEnvError extends Error {
    constructor(envName: string) {
        super(`Missing environment variable: ${envName}`);
        this.name = 'MissingEnvError';
    }
}
