import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { requestErrorResponse } from '../../../../utilities/request-response.utility.js';
import { PrismaClient } from '@prisma/client';
import { MerchantService, MerchantUpdate } from '../../../../services/database/merchant-service.database.service.js';
import { MerchantAuthToken } from '../../../../models/merchant-auth-token.model.js';
import { withAuth } from '../../../../utilities/token-authenticate.utility.js';
import {
    MerchantUpdateRequest,
    parseAndValidatePaymentAddressRequestBody,
} from '../../../../models/payment-address-request.model.js';

export const updateMerchant = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
    const prisma = new PrismaClient();
    const merchantService = new MerchantService(prisma);

    let merchantAuthToken: MerchantAuthToken;
    let merchantUpdateRequest: MerchantUpdateRequest;

    try {
        merchantAuthToken = withAuth(event.cookies);
    } catch (error) {
        return requestErrorResponse(error);
    }

    try {
        merchantUpdateRequest = parseAndValidatePaymentAddressRequestBody(event.body);
    } catch (error) {
        return requestErrorResponse(error);
    }

    if (merchantUpdateRequest.name == null && merchantUpdateRequest.paymentAddress == null) {
        return requestErrorResponse(new Error('No shop or payment address provided.'));
    }

    const merchant = await merchantService.getMerchant({ id: merchantAuthToken.id });

    if (merchant == null) {
        return requestErrorResponse(new Error('No merchant found.'));
    }

    var merchantUpdateQuery = {};

    if (merchantUpdateRequest.name != null) {
        merchantUpdateQuery['name'] = merchantUpdateRequest.name;
    }

    if (merchantUpdateRequest.paymentAddress != null) {
        merchantUpdateQuery['paymentAddress'] = merchantUpdateRequest.paymentAddress;
    }

    try {
        await merchantService.updateMerchant(merchant, merchantUpdateQuery as MerchantUpdate);
    } catch {
        return requestErrorResponse(new Error('Failed to update merchant.'));
    }

    // TODO: Define what the response should be.
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'Updated!',
        }),
    };
};
