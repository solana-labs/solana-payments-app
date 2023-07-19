import { InferType, object } from 'yup';
import { parseAndValidate } from '../utilities/yup.utility.js';
import { publicKeySchema } from './public-key-schema.model.js';

export const pointsSetupTransactionRequestScheme = object().shape({
    mintAddress: publicKeySchema.required(),
    merchantAddress: publicKeySchema.required(),
    gasAddress: publicKeySchema.required(),
});

export type PointsSetupTransactionRequest = InferType<typeof pointsSetupTransactionRequestScheme>;

export const parseAndValidatePointsSetupTransactionRequest = (
    pointsSetupTransactionRequestParams: unknown
): PointsSetupTransactionRequest => {
    return parseAndValidate(
        pointsSetupTransactionRequestParams,
        pointsSetupTransactionRequestScheme,
        'Invalid points setup transaction request'
    );
};
