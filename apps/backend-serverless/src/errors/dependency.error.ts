export class DependencyError extends Error {
    constructor(dependencyName: string) {
        super(`Issue with dependency: ${dependencyName}`);
        this.name = 'DependencyError';
    }
}
