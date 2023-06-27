import { AppRedirectQueryParam } from '../../models/shopify/redirect-query-params.model.js';
import crypto from 'crypto-js';
import { stringifyParams } from './stringify-params.utility.js';
import { PrismaClient } from '@prisma/client';
import { MerchantService } from '../../services/database/merchant-service.database.service.js';
import { UnauthorizedRequestError } from '../../errors/unauthorized-request.error.js';
import { MissingEnvError } from '../../errors/missing-env.error.js';

export const verifyRedirectParams = async (redirectParams: AppRedirectQueryParam, prisma: PrismaClient) => {
    const merchantService = new MerchantService(prisma);

    const merchant = await merchantService.getMerchant({ shop: redirectParams.shop });

    if (merchant == null) {
        throw new UnauthorizedRequestError('Incorrect merchant for auth.');
    }

    // Save the hmac, remove it from the object, get the query string after removing
    const hmac = redirectParams.hmac;

    if (hmac == undefined) {
        throw new UnauthorizedRequestError('missing hmac from request.');
    }

    delete redirectParams['hmac'];
    const queryStringAfterRemoving = stringifyParams(redirectParams);

    const secret = process.env.SHOPIFY_SECRET_KEY;

    // Check for a secret key to decode with
    if (secret == undefined) {
        throw new MissingEnvError('shopify secret');
    }

    const digest = crypto.HmacSHA256(queryStringAfterRemoving, secret);
    const digestString = digest.toString();

    if (digestString != hmac) {
        throw new UnauthorizedRequestError('hmac did not match.');
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
