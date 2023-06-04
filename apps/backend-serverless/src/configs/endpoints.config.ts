export const shopifyGraphQLEndpoint = (shopDomain: string) => {
    return `https://${shopDomain}/payments_apps/api/2022-10/graphql.json`;
};

export const shopifyAdminGraphQLEndpoint = (shopDomain: string) => {
    const shopName = shopDomain.split('.')[0];

    if (shopName == null || shopName == undefined || shopName == '') {
        throw new Error('Invalid shop domain.');
    }

    return `https://${shopName}/admin/api/2022-10/graphql.json`;
};
