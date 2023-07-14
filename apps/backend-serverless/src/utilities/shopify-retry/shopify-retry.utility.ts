import * as Sentry from '@sentry/serverless';
// These are the intervals I want to retry at
enum RetryTime {
    ZeroSeconds = 0,
    FiveSeconds = 5,
    TenSeconds = 10,
    ThirtySeconds = 30,
    FortyFiveSeconds = 45,
    OneMinute = 60,
    TwoMinutes = 120,
    FiveMinutes = 300,
    TwelveMinutes = 720,
    ThirtyEightMinutes = 2280,
    OneHour = 4560,
    TwoHours = 9120,
    FourHours = 18240,
}

const retryStepTimes: RetryTime[] = [
    RetryTime.ZeroSeconds,
    RetryTime.FiveSeconds,
    RetryTime.TenSeconds,
    RetryTime.ThirtySeconds,
    RetryTime.FortyFiveSeconds,
    RetryTime.OneMinute,
    RetryTime.TwoMinutes,
    RetryTime.FiveMinutes,
    RetryTime.TwelveMinutes,
    RetryTime.ThirtyEightMinutes,
    RetryTime.OneHour,
    RetryTime.TwoHours,
    RetryTime.FourHours,
    RetryTime.FourHours,
    RetryTime.FourHours,
    RetryTime.FourHours,
    RetryTime.FourHours,
];

export const nextRetryTimeInterval = (stepIndex: number) => {
    return retryStepTimes[stepIndex];
};

export const exhaustedRetrySteps = (stepIndex: number) => {
    return stepIndex >= retryStepTimes.length;
};

export const retry = async (fn: () => Promise<unknown>, maxAttempts: number): Promise<number> => {
    let attempts = 0;
    while (attempts < maxAttempts) {
        try {
            await fn();
            break;
        } catch (error) {
            Sentry.captureException({
                message: 'Failed retry ' + attempts,
                level: 'info',
            });
            attempts += 1;
        }
    }
    return attempts;
};
