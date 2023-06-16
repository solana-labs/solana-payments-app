import { MissingEnvError } from '../../errors/missing-env.error.js';
import { MissingExpectedDatabaseRecordError } from '../../errors/missing-expected-database-record.error.js';
import { UnauthorizedRequestError } from '../../errors/unauthorized-request.error.js';

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

export const createErrorResponse = (error: unknown) => {
    if (error instanceof MissingEnvError) {
        return fooBar(ErrorType.internalServerError, error.message);
    } else if (error instanceof UnauthorizedRequestError) {
        return fooBar(ErrorType.unauthorized, error.message);
    } else if (error instanceof MissingExpectedDatabaseRecordError) {
        return fooBar(ErrorType.notFound, error.message);
    } else if (error instanceof Error) {
        return fooBar(ErrorType.internalServerError, error.message);
    } else {
        return fooBar(ErrorType.internalServerError, 'Unknown error. Please contact support.');
    }
};

const fooBar = (statusCode: number, message: string) => {
    return {
        statusCode,
        body: JSON.stringify({
            error: message,
        }),
    };
};
