export function runValidParameterTest(parseAndValidateFunction, validParams) {
    it('valid request parameters parsing', () => {
        expect(() => {
            parseAndValidateFunction(validParams);
        }).not.toThrow();
    });
}

export function runMissingFieldTests(parseAndValidateFunction, validParams, fields) {
    for (const field of fields) {
        it(`missing required field ${field}`, () => {
            const testParams = { ...validParams }; // create a clone of the valid params
            delete testParams[field]; // remove a field to simulate missing input

            expect(() => {
                parseAndValidateFunction(testParams);
            }).toThrow();
        });
    }
}

export function runInvalidFieldTypeTests(parseAndValidateFunction, validParams, fields, wrongTypes) {
    for (const field of fields) {
        it(`invalid field type for ${field}`, () => {
            const testParams = { ...validParams }; // create a clone of the valid params
            testParams[field] = wrongTypes[field]; // set a field to a wrong type

            expect(() => {
                parseAndValidateFunction(testParams);
            }).toThrow();
        });
    }
}

export function runEmptyFieldTests(parseAndValidateFunction, validParams, fields) {
    for (const field of fields) {
        it(`should throw an error when ${field} is empty`, () => {
            const testParams = { ...validParams }; // create a clone of the valid params
            testParams[field] = ''; // set a field to an empty string

            expect(() => {
                parseAndValidateFunction(testParams);
            }).toThrow();
        });
    }
}
