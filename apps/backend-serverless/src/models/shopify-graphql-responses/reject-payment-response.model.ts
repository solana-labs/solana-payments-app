import { InferType, object } from 'yup';
import { parseAndValidateStrict } from '../../utilities/yup.utility.js';
import { sharedPaymentSessionSchema, shopifyResponseExtensionsSchema } from './shared.model.js';

export const dataPaymentSessionRejectSchema = object().shape({
    paymentSessionReject: sharedPaymentSessionSchema.required(),
});

export const paymentSessionRejectResponseSchema = object().shape({
    data: dataPaymentSessionRejectSchema.required(),
    extensions: shopifyResponseExtensionsSchema.required(),
});

export type RejectPaymentResponse = InferType<typeof paymentSessionRejectResponseSchema>;

export const parseAndValidateRejectPaymentResponse = (rejectPaymentResponeBody: unknown): RejectPaymentResponse => {
    return parseAndValidateStrict(
        rejectPaymentResponeBody,
        paymentSessionRejectResponseSchema,
        'Could not parse the reject payment response. Unknown Reason.',
    );
};
