import { Merchant } from '@prisma/client';
import axios from 'axios';
import https from 'https';
import { shopifyAdminGraphQLEndpoint } from '../../configs/endpoints.config.js';
import { parseAndValidateShopProductsResponse } from '../../models/shopify-graphql-responses/shop-products.model.js';

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

export interface FetchedProduct {
    id: string;
    title: string;
    handle: string;
    imageSrc: string | null;
}

export const fetchAllProducts = async (merchant: Merchant): Promise<FetchedProduct[]> => {
    let hasNextPage = true;
    let cursor: string | null = null;
    const allProducts: FetchedProduct[] = [];

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

        const productPromises = resolveShopProductsResponse.data.products.edges.map(async (edge: any) => {
            const id = edge.node.id.split('/').pop();
            const title = edge.node.title;
            const handle = edge.node.handle;

            // Fetch images for each product
            let productImageResponse;
            if (process.env.NODE_ENV === 'development') {
                const agent = new https.Agent({ rejectUnauthorized: false });
                productImageResponse = await axios({
                    url: `https://${merchant.shop}/admin/api/2023-07/products/${id}/images.json`,
                    method: 'GET',
                    headers: headers,
                    httpsAgent: agent,
                });
            } else {
                productImageResponse = await axios({
                    url: `https://${merchant.shop}/admin/api/2023-07/products/${id}/images.json`,
                    method: 'GET',
                    headers: headers,
                });
            }

            // Extract first image src or use null if there are no images
            const imageSrc = productImageResponse.data.images[0]?.src || null;

            return {
                id,
                title,
                handle,
                imageSrc,
            };
        });
        const products = await Promise.all(productPromises);

        allProducts.push(...products);

        hasNextPage = resolveShopProductsResponse.data.products.pageInfo.hasNextPage;
        cursor =
            resolveShopProductsResponse.data.products.edges[resolveShopProductsResponse.data.products.edges.length - 1]
                .cursor;
    }

    return allProducts;
};
