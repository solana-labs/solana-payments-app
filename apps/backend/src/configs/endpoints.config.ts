import { BASE_URL } from "../..";

export const SHOPIFY_GRAPH_QL_ENDPOINT =
  "https://{shop_domain}/payments_apps/api/2022-10/graphql.json";

export const shopifyGraphQLEndpoint = () => {
  const shopName = "myShop";
  return `https://${shopName}.myshopify.com/payments_apps/api/2022-10/graphql.json`;
};

// redirect url specified here: https://shopify.dev/apps/auth/oauth/getting-started#redirect-to-the-grant-screen-using-a-3xx-redirect
export const createShopifyOAuthGrantRedirectUrl = (
  shop: string,
  nonce: string
) => {
  const clientId = process.env.SHOPIFY_CLIENT_ID;
  const redirectUrl = BASE_URL + "/redirect"; // TODO: MAKE THIS ENV VAR
  return `https://${shop}/admin/oauth/authorize?client_id=${clientId}&scope=${requestedScopeString()}&redirect_uri=${redirectUrl}&state=${nonce}`;
};

// all scopes are listed here: https://shopify.dev/api/usage/access-scopes#authenticated-access-scopes
const requestedScopeString = () => {
  const paymentScopes = ["write_payment_gateways", "write_payment_sessions"];
  return paymentScopes.join(",");
};

// url to request access token as described here: https://shopify.dev/apps/auth/oauth/getting-started#step-5-get-an-access-token
export const accessTokenEndpoint = (shop: string, authCode: string) => {
  const clientId = process.env.SHOPIFY_CLIENT_ID;
  const clientSecret = process.env.SHOPIFY_SECRET_KEY;
  return `https://${shop}/admin/oauth/access_token?client_id=${clientId}&client_secret=${clientSecret}&code=${authCode}`;
};

// url to request id token as described here: https://web3auth.io/docs/guides/auth0#additional-reading-setup-custom-authentication-using-auth0-rwa
export const idTokenEndpoint = () => {
  const domainUrl = process.env.AUTH_0_DOMAIN;
  return `${domainUrl}/oauth/token`;
};

// url to redirect to your UI for oAuthf
export const oAuthRedirectEndpoint = () => {
  const frontEndUrl = process.env.FRONT_END_URL;
  return `${frontEndUrl}/`;
};

// url to redirect the user during oAuth after fetching their token as described here: https://web3auth.io/docs/guides/auth0#additional-reading-setup-custom-authentication-using-auth0-rwa
export const callbackRedirectEndpoint = (idToken: string) => {
  const frontEndUrl = process.env.FRONT_END_URL;
  return `${frontEndUrl}?token=%22+${idToken}`;
};

export const transactionRequestServerEndpoint = (
  feePayer: string,
  receiver: string,
  sendingToken: string,
  receivingToken: string,
  receivingAmount: number,
  amountType: string,
  transactionType: string
) => {
  const TRANSACTION_REQUEST_URL = process.env.TRANSACTION_REQUEST_URL;
  return `${TRANSACTION_REQUEST_URL}/pay?feePayer=${feePayer}&receiver=${receiver}&sendingToken=${sendingToken}&receivingToken=${receivingToken}&receivingAmount=${receivingAmount}&amountType=${amountType}&transactionType=${transactionType}`;
};
