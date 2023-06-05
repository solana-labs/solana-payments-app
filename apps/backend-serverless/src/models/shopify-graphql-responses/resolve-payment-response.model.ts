import { object, InferType } from 'yup';
import { parseAndValidate } from '../../utilities/yup.utility.js';
import { sharedPaymentSessionSchema, shopifyResponseExtensionsSchema } from './shared.model.js';

export const dataPaymentSessionResolveSchema = object().shape({
    paymentSessionResolve: sharedPaymentSessionSchema.required(),
});

export const paymentSessionResolveResponseSchema = object().shape({
    data: dataPaymentSessionResolveSchema.required(),
    extensions: shopifyResponseExtensionsSchema.required(),
});

export type ResolvePaymentResponse = InferType<typeof paymentSessionResolveResponseSchema>;

export const parseAndValidateResolvePaymentResponse = (resolvePaymentResponeBody: unknown): ResolvePaymentResponse => {
    return parseAndValidate(
        resolvePaymentResponeBody,
        paymentSessionResolveResponseSchema,
        'Could not parse the resolve payment response. Unknown Reason.'
    );
};
