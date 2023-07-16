import { logSentry } from '../sentry-log.utility.js';

export enum ErrorType {
    badRequest = 400,
    unauthorized = 401,
    forbidden = 403,
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
    forbidden = 'Invalid cookie. Your cookie may have expired or is not valid.',
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

export const createErrorResponse = (error: unknown) => {
    let statusCode: ErrorType;
    let message: string;

    if (error instanceof Error) {
        switch (error.name) {
            case 'MissingEnvError':
                statusCode = ErrorType.internalServerError;
                break;
            case 'UnauthorizedRequestError':
                statusCode = ErrorType.unauthorized;
                break;
            case 'MissingExpectedDatabaseRecordError':
                statusCode = ErrorType.notFound;
                break;
            case 'ForbiddenError':
                statusCode = ErrorType.forbidden;
                break;
            case 'ConflictingStateError':
                statusCode = ErrorType.conflict;
                break;
            case 'DependencyError':
                statusCode = ErrorType.internalServerError;
                break;
            case 'InvalidInputError':
                statusCode = ErrorType.badRequest;
                break;
            case 'MissingExpectedDatabaseValueError':
                statusCode = ErrorType.notFound;
                break;
            case 'RiskyWalletError':
                statusCode = ErrorType.unauthorized;
                break;
            case 'ShopifyResponseError':
                statusCode = ErrorType.internalServerError;
                break;
            default:
                statusCode = ErrorType.internalServerError;
        }
        message = error.message;
    } else {
        statusCode = ErrorType.internalServerError;
        message = 'Unknown error. Please contact support.';
    }

    console.log('error', error);
    logSentry(error, message);

    return {
        statusCode,
        body: JSON.stringify({ error: message }),
    };
};
