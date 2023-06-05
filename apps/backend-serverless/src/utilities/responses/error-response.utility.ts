export enum ErrorType {
    badRequest = 400,
    unauthorized = 401,
    notFound = 404,
    conflict = 409,
    internalServerError = 500,
}

export enum ErrorMessage {
    databaseAccessError = 'Database access error.',
    internalServerError = 'Internal server error.',
    missingBody = 'Missing body from request.',
    missingEnv = 'Missing internal configuration.',
    missingHeader = 'Missing header from request.',
    unknownMerchant = 'Merchant not found.',
    unknownPaymentRecord = 'Payment record not found.',
    unknownRefundRecord = 'Refund record not found.',
    invalidRequestParameters = 'Invalid request parameters.',
    invalidRequestBody = 'Invalid request body.',
    invalidRequestHeaders = 'Invalid request headers.',
    invalidSecurityInput = 'Invalid security input.',
    unauthorized = 'Unauthorized request.',
    incompatibleDatabaseRecords = 'Incompatible interal records.',
    incorrectPaymentRecordState = 'Incorrect payment state.',
    incorrectRefundRecordState = 'Incorrect refund state.',
    unauthorizedMerchant = 'Merchant is not authorized.',
}

export const errorResponse = (errorType: ErrorType, errorMessage: string) => {
    return {
        statusCode: errorType.valueOf(),
        body: JSON.stringify({
            error: errorMessage,
        }),
    };
};

export const errorTypeForError = (error: unknown): ErrorType => {
    if (error instanceof Error) {
        switch (error.name) {
            case 'MissingEnvError':
                return ErrorType.internalServerError;
            case 'ValidationError':
                return ErrorType.badRequest;
            case 'DependencyError':
                return ErrorType.internalServerError;
            default:
                return ErrorType.internalServerError;
        }
    } else {
        return ErrorType.internalServerError;
    }
};
