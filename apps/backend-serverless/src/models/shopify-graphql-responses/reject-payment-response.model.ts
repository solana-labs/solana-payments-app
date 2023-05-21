import { object, string, InferType, array } from 'yup';
import { parseAndValidate } from '../../utilities/yup.utility.js';
import { sharedPaymentResponseRootSchema, shopifyResponseExtensionsSchema } from './shared.model.js';

export const rejectPaymentResponseDataSchema = object().shape({
    paymentSessionReject: sharedPaymentResponseRootSchema.required(),
});

export const rejectPaymentResponseSchema = object().shape({
    data: rejectPaymentResponseDataSchema.required(),
    extensions: shopifyResponseExtensionsSchema.required(),
});

export type RejectPaymentResponse = InferType<typeof rejectPaymentResponseSchema>;

export const parseAndValidateResolvePaymentResponse = (rejectPaymentResponeBody: any): RejectPaymentResponse => {
    return parseAndValidate(
        rejectPaymentResponeBody,
        rejectPaymentResponseSchema,
        'Could not parse the reject payment response. Unknown Reason.'
    );
};
