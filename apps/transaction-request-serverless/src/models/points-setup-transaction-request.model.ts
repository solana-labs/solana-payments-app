import * as web3 from '@solana/web3.js';
import { InferType, object, string } from 'yup';
import { parseAndValidate } from '../utilities/yup.utility.js';

const publicKeySchema = string()
    .required()
    .test('is-public-key', 'Invalid public key', value => {
        try {
            if (value === undefined || value === null) {
                return false;
            }
            new web3.PublicKey(value);
            return true;
        } catch (err) {
            return false;
        }
    });

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
