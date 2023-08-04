import { InferType, boolean, number, object, string } from 'yup';
import { parseAndValidateStrict } from '../utilities/yup.utility.js';
import { publicKeySchema } from './public-key-schema.model.js';

export const paymentTransactionBodySchema = object().shape({
    loyaltyProgram: string().oneOf(['points', 'tiers', 'none']).optional(),
    payWithPoints: boolean().default(false).optional(),
    points: object().shape({
        mint: string().optional(),
        back: number().optional(),
    }),
    tiers: object()
        .shape({
            currentTier: publicKeySchema.optional(),
            customerOwns: boolean().default(false).optional(),
            currentDiscount: number().optional(),
            nextTier: publicKeySchema.optional(),
            isFirstTier: boolean().default(false).optional(),
        })
        .optional(),
});

export type PaymentTransactionBody = InferType<typeof paymentTransactionBodySchema>;

export const parseAndValidatePaymentTransactionBody = (loyaltyBody: unknown): PaymentTransactionBody => {
    return parseAndValidateStrict(
        loyaltyBody,
        paymentTransactionBodySchema,
        'Could not parse the loyalty body. Unknown Reason.'
    );
};
