import { InferType, Schema, number, object, string } from 'yup';
import { parseAndValidateStrict } from '../../utilities/yup.utility.js';
import { publicKeySchema } from '../public-key-schema.model.js';

// Create a helper function for conditional validation
function whenNoId<T extends Schema<any>>(schema: T): T {
    return schema.when('id', ([id], schema) => {
        return id === undefined ? schema.required() : schema.optional();
    });
}

export const tierSetupRequestBodySchema = object({
    id: number().optional(),
    name: string().required(),
    threshold: number().required(),
    discount: number().required(),
    payer: publicKeySchema.required(),
});

export type TierSetupRequest = InferType<typeof tierSetupRequestBodySchema>;

export const parseAndValidateTierSetupRequestBody = (tierSetupRequestBody: unknown): TierSetupRequest => {
    return parseAndValidateStrict(
        tierSetupRequestBody,
        tierSetupRequestBodySchema,
        'Could not parse the tier setup request body. Unknown Reason.'
    );
};
