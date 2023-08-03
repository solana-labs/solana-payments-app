import { InferType, Schema, boolean, number, object, string } from 'yup';
import { parseAndValidateStrict } from '../../../utilities/yup.utility.js';

function whenNoObject<T extends Schema<any>>(schema: T, name: string): T {
    return schema.when(name, ([val], schema) => {
        return val === undefined ? schema.optional() : schema.required();
    });
}

export const updateLoyaltyRequestBodySchema = object().shape({
    loyaltyProgram: string().oneOf(['points', 'tiers', 'none']).optional(),
    productStatus: string().oneOf(['tree', 'collection', 'ready']).optional(),
    points: object().shape({
        mint: string().optional(),
        back: number().optional(),
    }),
    tiers: object().shape({
        id: number().optional(),
        name: whenNoObject(string(), '$tiers'),
        threshold: whenNoObject(number(), '$tiers'),
        discount: whenNoObject(number(), '$tiers'),
        active: boolean().optional(),
        mint: string().optional(),
    }),
    products: object().shape({
        id: whenNoObject(string(), '$products'),
        uri: string().optional(),
        active: boolean().optional(),
    }),
});

export type UpdateLoyaltyRequest = InferType<typeof updateLoyaltyRequestBodySchema>;

export const parseAndValidateUpdateLoyaltyRequestBody = (updateLoyaltyRequestBody: unknown): UpdateLoyaltyRequest => {
    return parseAndValidateStrict(
        updateLoyaltyRequestBody,
        updateLoyaltyRequestBodySchema,
        'Could not parse the update loyalty request body. Unknown Reason.',
        updateLoyaltyRequestBody
    );
};
