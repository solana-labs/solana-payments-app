import { stringifyParams } from '../../../../src/utilities/shopify/stringify-params.utility';
import { parseAndValidateAppInstallQueryParms } from '../../../../src/models/shopify/install-query-params.model';

describe('stringifyParams', () => {
    it('should return a string', () => {
        const validInstallQueryParams = {
            hmac: 'some-hmac',
            shop: 'https://some-shop.myshopify.com',
            host: 'some-host',
            timestamp: 'some-timestamp',
        };

        const installParams = parseAndValidateAppInstallQueryParms(validInstallQueryParams);

        const result = stringifyParams(installParams);

        const expectedResult =
            'hmac=some-hmac&shop=https://some-shop.myshopify.com&host=some-host&timestamp=some-timestamp';

        expect(result).toBe(expectedResult);
    });
});
