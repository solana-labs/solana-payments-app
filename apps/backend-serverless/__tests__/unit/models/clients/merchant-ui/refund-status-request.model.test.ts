import { parseAndValidateRefundStatusRequest } from '../../../../../src/models/clients/merchant-ui/refund-status-request.model.js';

describe('unit testing refund status request model', () => {
    const fields = ['shopId'];
    const validRequestParams = {
        shopId: 'test-shop-id',
    };

    it('valid request parameters parsing', () => {
        expect(() => {
            parseAndValidateRefundStatusRequest(validRequestParams);
        }).not.toThrow();
    });

    for (const field of fields) {
        it(`missing required field ${field}`, () => {
            const testParams = { ...validRequestParams }; // create a clone of the valid params
            delete testParams[field]; // remove a field to simulate missing input

            expect(() => {
                parseAndValidateRefundStatusRequest(testParams);
            }).toThrow();
        });
    }

    const wrongTypes = {
        shopId: 12345, // should be a string
    };

    for (const field of fields) {
        it(`invalid field type for ${field}`, () => {
            const testParams = { ...validRequestParams }; // create a clone of the valid params
            testParams[field] = wrongTypes[field]; // set a field to a wrong type

            expect(() => {
                parseAndValidateRefundStatusRequest(testParams);
            }).toThrow();
        });
    }

    it('should throw an error when shopId is empty', () => {
        const requestParams = {
            shopId: '',
        };

        expect(() => {
            parseAndValidateRefundStatusRequest(requestParams);
        }).toThrow();
    });
});
