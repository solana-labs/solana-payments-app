import axios from 'axios';
import { shopifyAdminGraphQLEndpoint } from '../../configs/endpoints.config';
import { parseAndValidateAdminDataResponse } from '../../models/shopify-graphql-responses/admin-data.response.model';

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

        const response = await axiosInstance({
            url: shopifyAdminGraphQLEndpoint(shop),
            method: 'POST',
            headers: headers,
            data: JSON.stringify(graphqlQuery),
        });

        const paymentAppConfigureResponse = parseAndValidateAdminDataResponse(response.data);

        return paymentAppConfigureResponse;
    };
};
