import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { MissingEnvError } from '../../errors/missing-env.error';
import { UnauthorizedRequestError } from '../../errors/unauthorized-request.error';
import { AppRedirectQueryParam } from '../../models/shopify/redirect-query-params.model';
import { MerchantService } from '../../services/database/merchant-service.database.service';
import { stringifyParams } from './stringify-params.utility';

export const verifyRedirectParams = async (redirectParams: AppRedirectQueryParam, prisma: PrismaClient) => {
    const merchantService = new MerchantService(prisma);

    const merchant = await merchantService.getMerchant({ shop: redirectParams.shop });

    // Save the hmac, remove it from the object, get the query string after removing

    if (redirectParams.hmac == undefined) {
        throw new UnauthorizedRequestError('missing hmac from request.');
    }

    const hmac = redirectParams.hmac;
    delete redirectParams['hmac'];

    const secret = process.env.SHOPIFY_SECRET_KEY;
    if (secret == undefined) {
        throw new MissingEnvError('shopify secret');
    }

    const hmacGenerated = crypto
        .createHmac('sha256', secret)
        .update(Buffer.from(stringifyParams(redirectParams)))
        .digest('hex');

    if (hmacGenerated != hmac) {
        throw new UnauthorizedRequestError('hmac did not match. redirect' + JSON.stringify(redirectParams));
    }

    const nonce = redirectParams.state;
    const lastNonce = merchant.lastNonce;

    if (nonce != lastNonce) {
        throw new UnauthorizedRequestError('nonce did not match.');
    }

    const shop = redirectParams.shop;
    if (shop != merchant.shop) {
        throw new UnauthorizedRequestError('shop did not match.');
    }
};
