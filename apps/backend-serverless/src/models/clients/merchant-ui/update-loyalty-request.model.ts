import { InferType, boolean, number, object, string } from 'yup';
import { parseAndValidate } from '../../../utilities/yup.utility.js';

export const updateLoyaltyRequestBodySchema = object().shape({
    loyaltyProgram: string().oneOf(['points', 'tiers', 'none']).optional(),
    points: object().shape({
        mint: string().optional(),
        back: number().optional(),
    }),
    tiers: object()
        .shape({
            id: number().optional(),
            name: string().optional(),
            threshold: number().optional(),
            discount: number().optional(),
            active: boolean().optional(),
        })
        .optional(),
    products: object()
        .shape({
            productId: string().optional(),
            active: boolean().optional(),
        })
        .optional(),
});

export type UpdateLoyaltyRequest = InferType<typeof updateLoyaltyRequestBodySchema>;

export const parseAndValidateUpdateLoyaltyRequestBody = (updateLoyaltyRequestBody: unknown): UpdateLoyaltyRequest => {
    return parseAndValidate(
        updateLoyaltyRequestBody,
        updateLoyaltyRequestBodySchema,
        'Could not parse the update loyalty request body. Unknown Reason.'
    );
};
