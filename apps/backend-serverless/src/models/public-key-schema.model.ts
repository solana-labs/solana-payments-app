import * as web3 from '@solana/web3.js';
import { string } from 'yup';

export const publicKeySchema = string().test('is-public-key', 'Invalid public key', value => {
    try {
        if (value === undefined || value === null) {
            return true;
        }
        new web3.PublicKey(value);
        return true;
    } catch (err) {
        return false;
    }
});
