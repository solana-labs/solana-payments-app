import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';

export const admin = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
    const body = JSON.parse(event.body!);
    const query = body['query'];
    console.log('in the admin api', query);

    const productsRequest = query.includes('products');

    let data;
    if (productsRequest) {
        data = {
            products: {
                edges: [
                    {
                        node: {
                            id: 'gid://shopify/Product/1',
                            title: 'Crafty Shoes 1',
                            handle: 'crappy-shoes-1',
                            resourcePublicationOnCurrentPublication: null,
                        },
                        cursor: 'cursor',
                    },
                    {
                        node: {
                            id: 'gid://shopify/Product/2',
                            title: 'Crafty Shoes 2',
                            handle: 'crappy-shoes-2',
                            resourcePublicationOnCurrentPublication: null,
                        },
                        cursor: 'cursor',
                    },
                    {
                        node: {
                            id: 'gid://shopify/Product/3',
                            title: 'Crafty Shoes 3',
                            handle: 'crappy-shoes-3',
                            resourcePublicationOnCurrentPublication: null,
                        },
                        cursor: 'cursor',
                    },
                    {
                        node: {
                            id: 'gid://shopify/Product/4',
                            title: 'Crafty Shoes 4',
                            handle: 'crappy-shoes-4',
                            resourcePublicationOnCurrentPublication: null,
                        },
                        cursor: 'cursor',
                    },
                    {
                        node: {
                            id: 'gid://shopify/Product/5',
                            title: 'Crafty Shoes 5',
                            handle: 'crappy-shoes-5',
                            resourcePublicationOnCurrentPublication: null,
                        },
                        cursor: 'cursor',
                    },
                    {
                        node: {
                            id: 'gid://shopify/Product/6',
                            title: 'Crafty Shoes 6',
                            handle: 'crappy-shoes-6',
                            resourcePublicationOnCurrentPublication: null,
                        },
                        cursor: 'cursor',
                    },
                    {
                        node: {
                            id: 'gid://shopify/Product/7',
                            title: 'Crafty Shoes 7',
                            handle: 'crappy-shoes-7',
                            resourcePublicationOnCurrentPublication: null,
                        },
                        cursor: 'cursor',
                    },
                    {
                        node: {
                            id: 'gid://shopify/Product/8',
                            title: 'Crafty Shoes 8',
                            handle: 'crappy-shoes-8',
                            resourcePublicationOnCurrentPublication: null,
                        },
                        cursor: 'cursor',
                    },
                    {
                        node: {
                            id: 'gid://shopify/Product/9',
                            title: 'Crafty Shoes 9',
                            handle: 'crappy-shoes-9',
                            resourcePublicationOnCurrentPublication: null,
                        },
                        cursor: 'cursor',
                    },
                    {
                        node: {
                            id: 'gid://shopify/Product/10',
                            title: 'Crafty Shoes 10',
                            handle: 'crappy-shoes-10',
                            resourcePublicationOnCurrentPublication: null,
                        },
                        cursor: 'cursor',
                    },
                ],
                pageInfo: {
                    hasNextPage: false, // you might want to make this dynamic based on your mock data
                },
            },
        };
    } else {
        data = {
            shop: {
                name: 'Mock Shopify Store',
                email: 'harsha@solanapay.com',
                enabledPresentmentCurrencies: ['USD'],
            },
        };
    }

    return {
        statusCode: 200,
        body: JSON.stringify({
            data: data,
            extensions: {
                cost: {
                    requestedQueryCost: 1,
                    actualQueryCost: 1,
                    throttleStatus: {
                        maximumAvailable: 1000,
                        currentlyAvailable: 999,
                        restoreRate: 50,
                    },
                },
            },
        }),
    };
};
