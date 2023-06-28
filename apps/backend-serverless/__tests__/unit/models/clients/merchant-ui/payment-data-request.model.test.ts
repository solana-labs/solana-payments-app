import { parseAndValidatePaymentDataRequestParameters } from '../../../../../src/models/clients/merchant-ui/payment-data-request.model.js';

describe('unit testing payment data request model', () => {
    const fields = ['pageNumber', 'pageSize'];
    const validRequestParams = {
        pageNumber: 1,
        pageSize: 10,
    };

    it('valid request parameters parsing', () => {
        expect(() => {
            parseAndValidatePaymentDataRequestParameters(validRequestParams);
        }).not.toThrow();
    });

    for (const field of fields) {
        it(`missing required field ${field}`, () => {
            const testParams = { ...validRequestParams }; // create a clone of the valid params
            delete testParams[field]; // remove a field to simulate missing input

            expect(() => {
                parseAndValidatePaymentDataRequestParameters(testParams);
            }).toThrow();
        });
    }

    const wrongTypes = {
        pageNumber: '1', // should be a number
        pageSize: '10', // should be a number
    };

    for (const field of fields) {
        it(`invalid field type for ${field}`, () => {
            const testParams = { ...validRequestParams }; // create a clone of the valid params
            testParams[field] = wrongTypes[field]; // set a field to a wrong type

            expect(() => {
                parseAndValidatePaymentDataRequestParameters(testParams);
            }).toThrow();
        });
    }

    it('should throw an error for negative pageNumber', () => {
        const requestParams = {
            pageNumber: -1,
            pageSize: 10,
        };

        expect(() => {
            parseAndValidatePaymentDataRequestParameters(requestParams);
        }).toThrow();
    });
});
