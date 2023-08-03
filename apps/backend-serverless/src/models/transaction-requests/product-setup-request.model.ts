import { InferType, number, object, string } from 'yup';
import { parseAndValidateStrict } from '../../utilities/yup.utility.js';
import { publicKeySchema } from '../public-key-schema.model.js';

export const productSetupRequestBodySchema = object().shape({
    id: string().optional(),
    maxNFTs: number().optional(),
    name: string().optional(),
    symbol: string().optional(),
    payer: publicKeySchema.required(),
});

export type ProductSetupRequest = InferType<typeof productSetupRequestBodySchema>;

export const parseAndValidateProductSetupRequestBody = (productSetupRequestBody: unknown): ProductSetupRequest => {
    return parseAndValidateStrict(
        productSetupRequestBody,
        productSetupRequestBodySchema,
        'Could not parse the  product setup request body. Unknown Reason.'
    );
};
