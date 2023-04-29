// url to request access token as described here: https://shopify.dev/apps/auth/oauth/getting-started#step-5-get-an-access-token
export const accessTokenEndpoint = (shop: string, authCode: string) => {
    const clientId = process.env.SHOPIFY_CLIENT_ID;
    const clientSecret = process.env.SHOPIFY_SECRET_KEY;
    return `https://${shop}/admin/oauth/access_token?client_id=${clientId}&client_secret=${clientSecret}&code=${authCode}`;
  };