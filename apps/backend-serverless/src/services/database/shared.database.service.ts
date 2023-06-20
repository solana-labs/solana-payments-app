import { Prisma } from '@prisma/client';
import * as Sentry from '@sentry/serverless';

export const prismaErrorHandler = async <T>(promise: Promise<T>): Promise<T> => {
    try {
        const data = await promise;
        return data;
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            // Handle known error
            console.error('Known error: ', error);
        } else if (error instanceof Prisma.PrismaClientUnknownRequestError) {
            // Handle unknown error
            console.error('Unknown error: ', error);
        } else if (error instanceof Prisma.PrismaClientValidationError) {
            // Handle validation error
            console.error('Validation error: ', error);
        } else if (error instanceof Prisma.PrismaClientInitializationError) {
            // Handle initialization error
            console.error('Initialization error: ', error);
        } else if (error instanceof Prisma.PrismaClientRustPanicError) {
            // Handle Rust panic error
            console.error('Rust panic error: ', error);
        } else {
            // Handle other types of errors
            console.error('An unexpected error occurred: ', error);
        }

        Sentry.captureException(error);
        throw error;
    }
};
