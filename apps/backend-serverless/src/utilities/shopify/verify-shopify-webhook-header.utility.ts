import * as crypto from 'crypto-js';
import { MissingEnvError } from '../../errors/missing-env.error.js';
import { UnauthorizedRequestError } from '../../errors/unauthorized-request.error.js';

export const verifyShopifyWebhook = (data: string, hmacHeader: string) => {
    const shopifySecret = process.env.SHOPIFY_SECRET_KEY;

    if (shopifySecret == null) {
        throw new MissingEnvError('Missing shopify secret');
    }

    const hash = crypto.HmacSHA256(data, shopifySecret);
    const hmac = crypto.enc.Base64.stringify(hash);

    if (hmac !== hmacHeader) {
        throw new UnauthorizedRequestError('Invalid Hmac');
    }
};
