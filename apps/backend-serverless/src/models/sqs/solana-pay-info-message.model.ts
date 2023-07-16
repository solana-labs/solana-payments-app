import { InferType, object, string } from 'yup';
import { parseAndValidateStrict } from '../../utilities/yup.utility.js';

export const solanaPayInfoMessageSchema = object().shape({
    account: string().required(),
    paymentRecordId: string().required(),
});

export type SolanaPayInfoMessage = InferType<typeof solanaPayInfoMessageSchema>;

export const parseAndValidateSolanaPayInfoMessage = (solanaPayInfoMessageBody: unknown): SolanaPayInfoMessage => {
    return parseAndValidateStrict(
        solanaPayInfoMessageBody,
        solanaPayInfoMessageSchema,
        'Could not parse the solana pay info message body. Unknown Reason.',
    );
};
