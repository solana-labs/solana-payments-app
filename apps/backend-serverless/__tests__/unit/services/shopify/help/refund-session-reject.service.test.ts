import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { makeRefundSessionReject } from '../../../../../src/services/shopify/refund-session-reject.service';
import { RejectRefundResponse } from '../../../../../src/models/shopify-graphql-responses/reject-refund-response.model';
import { createMockSuccessRefundSessionRejectResponse } from '../../../../../src/utilities/testing-helper/create-mock.utility';

describe('unit testing refund session reject', () => {
    it('valid response', async () => {
        let mock = new MockAdapter(axios);
        const mockRefundSessionRejectResponse = createMockSuccessRefundSessionRejectResponse();
        mock.onPost().reply(200, mockRefundSessionRejectResponse);
        const mockRefundSessionReject = makeRefundSessionReject(axios);

        await expect(
            mockRefundSessionReject('mock-id', 'REJECTED', 'mock-message', 'mock-shop', 'mock-token')
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
