export const requestErrorResponse = (error: unknown) => {
    if (error instanceof Error) {
        return {
            statusCode: 500,
            body: JSON.stringify(
                {
                    error: error,
                },
                null,
                2
            ),
        };
    } else {
        return {
            statusCode: 500,
            body: JSON.stringify(
                {
                    error: 'Unknown Error',
                },
                null,
                2
            ),
        };
    }
};
