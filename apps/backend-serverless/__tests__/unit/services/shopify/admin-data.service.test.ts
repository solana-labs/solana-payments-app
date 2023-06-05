import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { makeAdminData } from '../../../../src/services/shopify/admin-data.service.js';
import { createMockAdminDataResponse } from '../../../../src/utilities/testing-helper/create-mock.utility.js';

describe('unit testing payment app configure', () => {
    it('successful response', async () => {
        const mock = new MockAdapter(axios);
        const mockAdminDataResponse = createMockAdminDataResponse();
        mock.onPost().reply(200, mockAdminDataResponse);
        const mockAdminData = makeAdminData(axios);

        await expect(mockAdminData('mock-shop', 'mock-token')).resolves.not.toThrow();
    });
});
