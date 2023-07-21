// url to request access token as described here: https://shopify.dev/apps/auth/oauth/getting-started#step-5-get-an-access-token
export const accessTokenEndpoint = (shop: string, authCode: string) => {
    const clientId = process.env.SHOPIFY_CLIENT_ID;
    const clientSecret = process.env.SHOPIFY_SECRET_KEY;
    return `https://${shop}/admin/oauth/access_token?client_id=${clientId}&client_secret=${clientSecret}&code=${authCode}`;
};
const TRANSACTION_REQUEST_SERVER_URL = process.env.TRANSACTION_REQUEST_SERVER_URL;

export const buildPayTransactionRequestEndpoint = (
    receiverWalletAddress: string | null,
    receiverTokenAddress: string | null,
    sender: string,
    receivingToken: string,
    sendingToken: string,
    feePayer: string,
    receivingAmount: string,
    amountType: string,
    transactionType: string,
    createAta: string,
    singleUseNewAcc: string,
    singleUsePayer: string,
    indexInputs: string,
    loyaltyProgram: string | null,
    pointsMint: string | null,
    pointsBack: string | null,
    payWithPoints: string = 'false'
) => {
    if (TRANSACTION_REQUEST_SERVER_URL == null) {
        throw new Error('Missing TRANSACTION_REQUEST_SERVER_URL environment variable.');
    }

    const params = {
        receiverWalletAddress,
        receiverTokenAddress,
        sender,
        receivingToken,
        sendingToken,
        feePayer,
        receivingAmount,
        amountType,
        transactionType,
        createAta,
        singleUseNewAcc,
        singleUsePayer,
        indexInputs,
        loyaltyProgram,
        pointsMint,
        pointsBack,
        payWithPoints,
    };

    const queryString = Object.entries(params)
        .filter(([_, value]) => value != null)
        .map(([key, value]) => `${key}=${value}`)
        .join('&');

    return `${TRANSACTION_REQUEST_SERVER_URL}/pay?${queryString}`;
};

export const buildRefundTransactionRequestEndpoint = (
    receiverWalletAddress: string | null,
    receiverTokenAddress: string | null,
    sender: string,
    receivingToken: string,
    sendingToken: string,
    feePayer: string,
    receivingAmount: string,
    amountType: string,
    transactionType: string,
    createAta: string,
    singleUseNewAcc: string,
    singleUsePayer: string,
    indexInputs: string
) => {
    if (TRANSACTION_REQUEST_SERVER_URL == null) {
        throw new Error('Missing TRANSACTION_REQUEST_SERVER_URL environment variable.');
    }

    const params = {
        receiverWalletAddress,
        receiverTokenAddress,
        sender,
        receivingToken,
        sendingToken,
        feePayer,
        receivingAmount,
        amountType,
        transactionType,
        createAta,
        singleUseNewAcc,
        singleUsePayer,
        indexInputs,
    };

    const queryString = Object.entries(params)
        .filter(([_, value]) => value != null)
        .map(([key, value]) => `${key}=${value}`)
        .join('&');

    return `${TRANSACTION_REQUEST_SERVER_URL}/pay?${queryString}`;
};

export const buildPointsSetupTransactionRequestEndpoint = (
    mintAddress: string,
    merchantAddress: string,
    gasAddress: string
) => {
    if (TRANSACTION_REQUEST_SERVER_URL == null) {
        throw new Error('Missing TRANSACTION_REQUEST_SERVER_URL environment variable.');
    }

    const params = {
        mintAddress,
        merchantAddress,
        gasAddress,
    };

    const queryString = Object.entries(params)
        .filter(([_, value]) => value != null)
        .map(([key, value]) => `${key}=${value}`)
        .join('&');

    return `${TRANSACTION_REQUEST_SERVER_URL}/points-setup?${queryString}`;
};
