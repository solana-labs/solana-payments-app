type ParseAndValidateFn<T> = (params: T) => void;

export function runValidParameterTest<T>(parseAndValidateFunction: ParseAndValidateFn<T>, validParams: T) {
    it('valid request parameters parsing', () => {
        expect(() => {
            parseAndValidateFunction(validParams);
        }).not.toThrow();
    });
}

export function runMissingFieldTests<T>(
    parseAndValidateFunction: ParseAndValidateFn<T>,
    validParams: T,
    fields: string[]
) {
    for (const field of fields) {
        it(`missing required field ${field}`, () => {
            const testParams = { ...validParams }; // create a clone of the valid params
            delete testParams[field]; // remove a field to simulate missing input

            expect(() => {
                parseAndValidateFunction(testParams as T);
            }).toThrow();
        });
    }
}

export function runInvalidFieldTypeTests<T>(
    parseAndValidateFunction: ParseAndValidateFn<T>,
    validParams: T,
    fields: string[],
    wrongTypes: Record<string, any>
) {
    for (const field of fields) {
        it(`invalid field type for ${field}`, () => {
            const testParams = { ...validParams }; // create a clone of the valid params
            testParams[field] = wrongTypes[field]; // set a field to a wrong type

            expect(() => {
                parseAndValidateFunction(testParams as T);
            }).toThrow();
        });
    }
}

export function runEmptyFieldTests<T>(
    parseAndValidateFunction: ParseAndValidateFn<T>,
    validParams: T,
    fields: string[]
) {
    for (const field of fields) {
        it(`should throw an error when ${field} is empty`, () => {
            const testParams = { ...validParams }; // create a clone of the valid params
            testParams[field] = ''; // set a field to an empty string

            expect(() => {
                parseAndValidateFunction(testParams as T);
            }).toThrow();
        });
    }
}

export function runMissingFieldTestsInArray<T>(
    validatorFn: ParseAndValidateFn<T>,
    validParams: T,
    arrayFieldName: string,
    fields: string[]
) {
    for (const field of fields) {
        it(`missing ${field} in array field ${arrayFieldName}`, () => {
            const testParams = { ...validParams }; // create a clone of the valid params
            testParams[arrayFieldName] = testParams[arrayFieldName].map((item: any) => {
                const newItem = { ...item };
                delete newItem[field];
                return newItem;
            });

            expect(() => {
                validatorFn(testParams as T);
            }).toThrow();
        });
    }
}

export function runInvalidFieldTypeTestsInArray<T>(
    validatorFn: ParseAndValidateFn<T>,
    validParams: T,
    arrayFieldName: string,
    fields: string[],
    wrongTypes: Record<string, any>
) {
    for (const field of fields) {
        it(`invalid type for ${field} in array field ${arrayFieldName}`, () => {
            const testParams = { ...validParams }; // create a clone of the valid params
            testParams[arrayFieldName] = testParams[arrayFieldName].map((item: any) => {
                return { ...item, [field]: wrongTypes[field] }; // set a field to a wrong type
            });

            expect(() => {
                validatorFn(testParams as T);
            }).toThrow();
        });
    }
}

export function runEmptyFieldTestsInArray<T>(
    validatorFn: ParseAndValidateFn<T>,
    validParams: T,
    arrayFieldName: string,
    fields: string[]
) {
    for (const field of fields) {
        it(`empty ${field} in array field ${arrayFieldName}`, () => {
            const testParams = { ...validParams }; // create a clone of the valid params
            testParams[arrayFieldName] = testParams[arrayFieldName].map((item: any) => {
                return { ...item, [field]: '' }; // set a field to an empty string
            });

            expect(() => {
                validatorFn(testParams as T);
            }).toThrow();
        });
    }
}
