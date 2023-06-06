import { object, InferType, string, boolean } from 'yup';
import { parseAndValidate } from '../../../utilities/yup.utility.js';

export const merchantUpdateRequestBodySchema = object().shape({
    paymentAddress: string().optional(),
    name: string().optional(),
    acceptedTermsAndConditions: boolean().optional(),
    dismissCompleted: boolean().optional(),
    kybInquiry: string().optional(),
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
