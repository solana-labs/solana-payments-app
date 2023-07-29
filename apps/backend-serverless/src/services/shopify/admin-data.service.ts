import axios from 'axios';
import https from 'https';
import { shopifyAdminGraphQLEndpoint } from '../../configs/endpoints.config.js';
import { parseAndValidateAdminDataResponse } from '../../models/shopify-graphql-responses/admin-data.response.model.js';

const adminDataRequest = `
    {
        shop {
            name
            email
            enabledPresentmentCurrencies
        }
    }
`;

export const makeAdminData = (axiosInstance: typeof axios) => {
    return async (shop: string, token: string) => {
        const headers = {
            'content-type': 'application/json',
            'X-Shopify-Access-Token': token,
        };
        const graphqlQuery = {
            query: adminDataRequest,
            variables: {},
        };

        let response;
        if (process.env.NODE_ENV === 'development') {
            const agent = new https.Agent({
                rejectUnauthorized: false,
            });

            response = await axios({
                url: shopifyAdminGraphQLEndpoint(shop),
                method: 'POST',
                headers: headers,
                data: JSON.stringify(graphqlQuery),
                httpsAgent: agent,
            });
        } else {
            response = await axios({
                url: shopifyAdminGraphQLEndpoint(shop),
                method: 'POST',
                headers: headers,
                data: JSON.stringify(graphqlQuery),
            });
        }

        const paymentAppConfigureResponse = parseAndValidateAdminDataResponse(response.data);

        return paymentAppConfigureResponse;
    };
};
