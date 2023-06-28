import { parseAndValidateRejectRefundRequest } from '../../../../../src/models/clients/merchant-ui/reject-refund-request.model.js';

describe('unit testing reject refund request model', () => {
    const fields = ['refundId', 'merchantReason'];
    const validRequestBody = {
        refundId: 'test-refund-id',
        merchantReason: 'test-reason',
    };

    it('valid request parameters parsing', () => {
        expect(() => {
            parseAndValidateRejectRefundRequest(validRequestBody);
        }).not.toThrow();
    });

    for (const field of fields) {
        it(`missing required field ${field}`, () => {
            const testBody = { ...validRequestBody }; // create a clone of the valid body
            delete testBody[field]; // remove a field to simulate missing input

            expect(() => {
                parseAndValidateRejectRefundRequest(testBody);
            }).toThrow();
        });
    }

    const wrongTypes = {
        refundId: 12345, // should be a string
        merchantReason: 12345, // should be a string
    };

    for (const field of fields) {
        it(`invalid field type for ${field}`, () => {
            const testBody = { ...validRequestBody }; // create a clone of the valid body
            testBody[field] = wrongTypes[field]; // set a field to a wrong type

            expect(() => {
                parseAndValidateRejectRefundRequest(testBody);
            }).toThrow();
        });
    }

    for (const field of fields) {
        it(`should throw an error when ${field} is empty`, () => {
            const testBody = { ...validRequestBody }; // create a clone of the valid body
            testBody[field] = ''; // set a field to an empty string

            expect(() => {
                parseAndValidateRejectRefundRequest(testBody);
            }).toThrow();
        });
    }
});
