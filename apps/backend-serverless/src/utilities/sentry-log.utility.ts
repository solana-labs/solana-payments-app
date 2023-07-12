import * as Sentry from '@sentry/serverless';

export async function logSentry(error: any, message: string) {
    Sentry.captureException(error);
    Sentry.captureMessage(message);
    await Sentry.flush(2000);
}
