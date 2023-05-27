import { stringifyParams } from '../../../src/utilities/stringify-params.utility';
import { parseAndValidateAppInstallQueryParms } from '../../../src/models/install-query-params.model';

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

        console.log(result);

        const expectedResult =
            'hmac=some-hmac&shop=https://some-shop.myshopify.com&host=some-host&timestamp=some-timestamp';

        expect(result).toBe(expectedResult);
    });
});
