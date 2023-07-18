import * as Sentry from '@sentry/serverless';
import { ConflictingStateError } from '../errors/conflicting-state.error.js';
import { DependencyError } from '../errors/dependency.error.js';
import { InvalidInputError } from '../errors/invalid-input.error.js';
import { MissingEnvError } from '../errors/missing-env.error.js';
import { MissingExpectedDatabaseRecordError } from '../errors/missing-expected-database-record.error.js';
import { MissingExpectedDatabaseValueError } from '../errors/missing-expected-database-value.error.js';
import { RiskyWalletError } from '../errors/risky-wallet.error.js';
import { UnauthorizedRequestError } from '../errors/unauthorized-request.error.js';

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

export const createErrorResponse = async (error: unknown) => {
    let statusCode: ErrorType;
    let message: string;

    if (error instanceof MissingEnvError) {
        statusCode = ErrorType.internalServerError;
        message = error.message;
    } else if (error instanceof UnauthorizedRequestError) {
        statusCode = ErrorType.unauthorized;
        message = error.message;
    } else if (error instanceof MissingExpectedDatabaseRecordError) {
        statusCode = ErrorType.notFound;
        message = error.message;
    } else if (error instanceof ConflictingStateError) {
        statusCode = ErrorType.conflict;
        message = error.message;
    } else if (error instanceof DependencyError) {
        statusCode = ErrorType.internalServerError;
        message = error.message;
    } else if (error instanceof InvalidInputError) {
        statusCode = ErrorType.badRequest;
        message = error.message;
    } else if (error instanceof MissingExpectedDatabaseValueError) {
        statusCode = ErrorType.notFound;
        message = error.message;
    } else if (error instanceof RiskyWalletError) {
        statusCode = ErrorType.unauthorized;
        message = error.message;
    } else if (error instanceof Error) {
        statusCode = ErrorType.internalServerError;
        message = error.message;
    } else {
        statusCode = ErrorType.internalServerError;
        message = 'Unknown error. Please contact support.';
    }

    Sentry.captureException(error, {
        extra: {
            message,
        },
    });
    await Sentry.flush(2000);

    return {
        statusCode,
        body: JSON.stringify({ error: message }),
    };
};
