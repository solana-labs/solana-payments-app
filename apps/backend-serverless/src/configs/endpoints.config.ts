export const shopifyGraphQLEndpoint = (shopDomain: string) => {
    return `https://${shopDomain}/payments_apps/api/2022-10/graphql.json`;
};

export const shopifyAdminGraphQLEndpoint = (shopDomain: string) => {
    return `https://${shopDomain}/admin/api/2022-10/graphql.json`;
};

export const shopifyAdminRestEndpoint = (shopDomain: string, resource: string) => {
    return `https://${shopDomain}/admin/api/2022-10/${resource}.json`;
};
