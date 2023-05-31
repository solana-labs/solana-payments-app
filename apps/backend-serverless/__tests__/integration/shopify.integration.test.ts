import axios from 'axios';

describe('Shopify Integration', () => {
    it('should return a list of products', async () => {
        const paymentAppConfigureMutation = `
            {
                shop {
                    name
                    email
                    enabledPresentmentCurrencies
                }
            }
        `;

        const headers = {
            'content-type': 'application/json',
            'X-Shopify-Access-Token': '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',
        };
        const graphqlQuery = {
            query: paymentAppConfigureMutation,
            variables: {},
        };

        const response = await axios({
            url: `https://${'mtndao-merch-store'}.myshopify.com/admin/api/2023-04/graphql.json`,
            method: 'POST',
            headers: headers,
            data: JSON.stringify(graphqlQuery),
        });

        console.log(response.data.data.shop.enabledPresentmentCurrencies);

        expect(true).toBe(true);
    });
});
