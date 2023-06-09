import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { ForbiddenError } from '../../errors/forbidden.error.js';
import { UnauthorizedError } from '../../errors/unauthorized.error.js';
import { NotFoundError } from '../../errors/not-found.error.js';

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
    forbidden = 'Invalid cookie. Your cookie may have expired or is not valid.',
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

export const errorResponseForError = (error: unknown): APIGatewayProxyResultV2 => {
    if (error instanceof UnauthorizedError) {
        return errorResponse(ErrorType.unauthorized, error.message);
    } else if (error instanceof ForbiddenError) {
        return errorResponse(ErrorType.forbidden, error.message);
    } else if (error instanceof NotFoundError) {
        return errorResponse(ErrorType.notFound, error.message);
    } else if (error instanceof Error) {
        return errorResponse(ErrorType.internalServerError, error.message);
    } else {
        return errorResponse(ErrorType.internalServerError, 'Unknown error');
    }
};
