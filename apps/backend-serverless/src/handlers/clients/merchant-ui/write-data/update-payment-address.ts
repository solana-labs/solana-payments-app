import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { requestErrorResponse } from '../../../../utilities/request-response.utility.js';
import { PrismaClient } from '@prisma/client';
import { decode } from '../../../../utilities/string.utility.js';
import queryString from 'query-string';
import { MerchantService } from '../../../../services/database/merchant-service.database.service.js';
import { MerchantAuthToken } from '../../../../models/merchant-auth-token.model.js';
import { withAuth } from '../../../../utilities/token-authenticate.utility.js';
import {
    PaymentAddressRequest,
    parseAndValidatePaymentAddressRequestBody,
} from '../../../../models/payment-address-request.model.js';

export const updatePaymentAddress = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
    const prisma = new PrismaClient();
    const merchantService = new MerchantService(prisma);

    let merchantAuthToken: MerchantAuthToken;
    let paymentAddressRequest: PaymentAddressRequest;

    try {
        merchantAuthToken = withAuth(event.cookies);
    } catch (error) {
        return requestErrorResponse(error);
    }

    try {
        paymentAddressRequest = parseAndValidatePaymentAddressRequestBody(event.body);
    } catch (error) {
        return requestErrorResponse(error);
    }

    const newPaymentAddress = paymentAddressRequest.paymentAddress;

    if (newPaymentAddress == null) {
        return requestErrorResponse(new Error('No shop or payment address provided.'));
    }

    const merchant = await merchantService.getMerchant({ id: merchantAuthToken.id });

    if (merchant == null) {
        return requestErrorResponse(new Error('No merchant found.'));
    }

    try {
        await merchantService.updateMerchant(merchant, {
            paymentAddress: newPaymentAddress,
        });
    } catch {
        return requestErrorResponse(new Error('Failed to update merchant.'));
    }

    // TODO: Define what the response should be.
    return {
        statusCode: 200,
        body: JSON.stringify(
            {
                message: 'Updated!',
            },
            null,
            2
        ),
    };
};
