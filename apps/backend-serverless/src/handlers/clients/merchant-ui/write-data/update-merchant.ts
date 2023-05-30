import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { requestErrorResponse } from '../../../../utilities/request-response.utility.js';
import { PrismaClient } from '@prisma/client';
import { MerchantService, MerchantUpdate } from '../../../../services/database/merchant-service.database.service.js';
import { MerchantAuthToken } from '../../../../models/clients/merchant-ui/merchant-auth-token.model.js';
import { withAuth } from '../../../../utilities/token-authenticate.utility.js';
import {
    MerchantUpdateRequest,
    parseAndValidatePaymentAddressRequestBody,
} from '../../../../models/clients/merchant-ui/payment-address-request.model.js';
import { createGeneralResponse } from '../../../../utilities/create-general-response.js';
import { createOnboardingResponse } from '../../../../utilities/create-onboarding-response.utility.js';
import { ErrorMessage, ErrorType, errorResponse } from '../../../../utilities/responses/error-response.utility.js';

export const updateMerchant = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
    const prisma = new PrismaClient();
    const merchantService = new MerchantService(prisma);

    let merchantAuthToken: MerchantAuthToken;
    let merchantUpdateRequest: MerchantUpdateRequest;

    try {
        merchantAuthToken = withAuth(event.cookies);
    } catch (error) {
        return errorResponse(ErrorType.unauthorized, ErrorMessage.unauthorized);
    }

    try {
        merchantUpdateRequest = parseAndValidatePaymentAddressRequestBody(event.body);
    } catch (error) {
        return errorResponse(ErrorType.badRequest, ErrorMessage.invalidRequestBody);
    }

    if (
        merchantUpdateRequest.name == null &&
        merchantUpdateRequest.paymentAddress == null &&
        merchantUpdateRequest.acceptedTermsAndConditions == null &&
        merchantUpdateRequest.dismissCompleted == null
    ) {
        return errorResponse(ErrorType.badRequest, ErrorMessage.invalidRequestBody);
    }

    let merchant = await merchantService.getMerchant({ id: merchantAuthToken.id });

    if (merchant == null) {
        return errorResponse(ErrorType.notFound, ErrorMessage.unknownMerchant);
    }

    const merchantUpdateQuery = {};

    if (merchantUpdateRequest.name != null) {
        merchantUpdateQuery['name'] = merchantUpdateRequest.name;
    }

    if (merchantUpdateRequest.paymentAddress != null) {
        merchantUpdateQuery['paymentAddress'] = merchantUpdateRequest.paymentAddress;
    }

    if (merchantUpdateRequest.acceptedTermsAndConditions != null) {
        merchantUpdateQuery['acceptedTermsAndConditions'] = merchantUpdateRequest.acceptedTermsAndConditions;
    }

    if (merchantUpdateRequest.dismissCompleted != null) {
        merchantUpdateQuery['dismissCompleted'] = merchantUpdateRequest.dismissCompleted;
    }

    try {
        merchant = await merchantService.updateMerchant(merchant, merchantUpdateQuery as MerchantUpdate);
    } catch {
        return errorResponse(ErrorType.internalServerError, ErrorMessage.internalServerError);
    }

    const generalResponse = await createGeneralResponse(merchantAuthToken, prisma);
    const onboardingResponse = createOnboardingResponse(merchant);

    // TODO: Create a type for this
    const responseBodyData = {
        merchantData: {
            name: merchant.name,
            paymentAddress: merchant.paymentAddress,
            onboarding: onboardingResponse,
        },
        general: generalResponse,
    };

    return {
        statusCode: 200,
        body: JSON.stringify(responseBodyData),
    };
};
