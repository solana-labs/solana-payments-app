import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { makeRefundSessionReject } from '../../../../src/services/shopify/refund-session-reject.service.js';
import { createMockSuccessRefundSessionRejectResponse } from '../../../../src/utilities/testing-helper/create-mock.utility.js';

describe('unit testing refund session reject', () => {
    it('valid response', async () => {
        const mock = new MockAdapter(axios);
        const mockRefundSessionRejectResponse = createMockSuccessRefundSessionRejectResponse();
        mock.onPost().reply(200, mockRefundSessionRejectResponse);
        const mockRefundSessionReject = makeRefundSessionReject(axios);

        await expect(
            mockRefundSessionReject('mock-id', 'REJECTED', 'mock-message', 'mock-shop', 'mock-token'),
        ).resolves.not.toThrow();
    });

    // it('invalid response, missing id', async () => {
    //     let mock = new MockAdapter(axios);
    //     const mockRefundSessionRejectResponse = createMockSuccessRefundSessionRejectResponse();
    //     mock.onPost().reply(200, mockRefundSessionRejectResponse);
    //     const mockRefundSessionReject = makeRefundSessionReject(axios);

    //     await expect(
    //         mockRefundSessionReject('mock-id', 'REJECTED', 'mock-message', 'mock-shop', 'mock-token')
    //     ).rejects.toThrow();
    // });
});
