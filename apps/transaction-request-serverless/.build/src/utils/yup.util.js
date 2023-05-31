export var parseAndValidate = function (data, schema, errorMessage) {
    var parsedData;
    try {
        schema.validateSync(data);
        parsedData = schema.cast(data);
    }
    catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        else {
            throw new Error(errorMessage);
        }
    }
    return parsedData;
};
//# sourceMappingURL=yup.util.js.map