export var requestErrorResponse = function (error) {
    if (error instanceof Error) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: error.message,
            }, null, 2),
        };
    }
    else {
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: "Unknown Error",
            }, null, 2),
        };
    }
};
//# sourceMappingURL=request-response.utility.js.map