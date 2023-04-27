export const shopifyGraphQLEndpoint = (shopDomain: string) => {
    return `https://${shopDomain}.myshopify.com/payments_apps/api/2022-10/graphql.json`
}
