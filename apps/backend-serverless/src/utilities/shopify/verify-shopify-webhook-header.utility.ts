import crypto from 'crypto';
import { MissingEnvError } from '../../errors/missing-env.error.js';
import { UnauthorizedRequestError } from '../../errors/unauthorized-request.error.js';

export const verifyShopifyWebhook = (data: Buffer, hmacHeader: string) => {
    const shopifySecret = process.env.SHOPIFY_SECRET_KEY;

    console.log('Shopify secret key:', shopifySecret);

    if (shopifySecret == null) {
        throw new MissingEnvError('Missing shopify secret');
    }
    const hmac = crypto.createHmac('sha256', shopifySecret).update(data).digest('base64');
    const hmacHex = crypto.createHmac('sha256', shopifySecret).update(data).digest('hex');

    console.log('hmac', hmac);
    console.log('hmacHeader', hmacHeader);
    console.log('hmacHex', hmacHex);

    if (hmac !== hmacHeader) {
        throw new UnauthorizedRequestError('Invalid Hmac');
    }
};
