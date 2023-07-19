import { InferType, boolean, number, object, string } from 'yup';
import { parseAndValidate } from '../../../utilities/yup.utility.js';
import { publicKeySchema } from '../../public-key-schema.model.js';

export const merchantUpdateRequestBodySchema = object().shape({
    paymentAddress: publicKeySchema.optional(),
    name: string().optional(),
    acceptedTermsAndConditions: boolean().optional(),
    acceptedPrivacyPolicy: boolean().optional(),
    dismissCompleted: boolean().optional(),
    kybInquiry: string().optional(),
    loyaltyProgram: string().optional(),
    pointsMint: string().optional(),
    pointsBack: number().optional(),
});

export type MerchantUpdateRequest = InferType<typeof merchantUpdateRequestBodySchema>;

export const parseAndValidatePaymentAddressRequestBody = (
    merchantUpdateRequestBody: unknown
): MerchantUpdateRequest => {
    return parseAndValidate(
        merchantUpdateRequestBody,
        merchantUpdateRequestBodySchema,
        'Could not parse the merchant update request body. Unknown Reason.'
    );
};
