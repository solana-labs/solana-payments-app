export class ConflictingStateError extends Error {
    constructor(issue: string) {
        super(`Conflicting issue: ${issue}`);
        this.name = 'ConflictingStateError';
    }
}
