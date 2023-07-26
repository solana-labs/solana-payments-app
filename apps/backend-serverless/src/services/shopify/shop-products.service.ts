import { Merchant } from '@prisma/client';
import axios from 'axios';
import https from 'https';
import { shopifyAdminGraphQLEndpoint } from '../../configs/endpoints.config.js';
import {
    ProductNode,
    parseAndValidateShopProductsResponse,
} from '../../models/shopify-graphql-responses/shop-products.model.js';

const getProductsRequest = (cursor: string | null) => {
    return `
        {
            products(first: 10, ${cursor ? `after: "${cursor}"` : ''}) {
                edges {
                    node {
                        id
                        title
                        handle
                    }
                    cursor
                }
                pageInfo {
                    hasNextPage
                }
            }
        }
    `;
};

export const fetchAllProducts = async (merchant: Merchant): Promise<ProductNode[]> => {
    let hasNextPage = true;
    let cursor: string | null = null;
    const allProducts: ProductNode[] = [];

    if (!merchant.accessToken) {
        return allProducts;
    }

    const headers = {
        'content-type': 'application/json',
        'X-Shopify-Access-Token': merchant.accessToken,
    };

    while (hasNextPage) {
        const graphqlQuery = {
            query: getProductsRequest(cursor),
            variables: {},
        };

        let response;
        if (process.env.NODE_ENV === 'development') {
            const agent = new https.Agent({
                rejectUnauthorized: false,
            });

            response = await axios({
                url: shopifyAdminGraphQLEndpoint(merchant.shop),
                method: 'POST',
                headers: headers,
                data: JSON.stringify(graphqlQuery),
                httpsAgent: agent,
            });
        } else {
            response = await axios({
                url: shopifyAdminGraphQLEndpoint(merchant.shop),
                method: 'POST',
                headers: headers,
                data: JSON.stringify(graphqlQuery),
            });
        }

        let resolveShopProductsResponse = parseAndValidateShopProductsResponse(response.data);

        const products = resolveShopProductsResponse.data.products.edges.map((edge: any) => edge.node);
        allProducts.push(...products);

        hasNextPage = resolveShopProductsResponse.data.products.pageInfo.hasNextPage;
        cursor =
            resolveShopProductsResponse.data.products.edges[resolveShopProductsResponse.data.products.edges.length - 1]
                .cursor;
    }

    return allProducts;
};
