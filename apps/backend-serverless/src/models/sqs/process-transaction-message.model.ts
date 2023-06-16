import { object, string, InferType } from 'yup';
import { parseAndValidate } from '../../utilities/yup.utility.js';

export const processTransactionMessageSchema = object().shape({
    signature: string().required(),
});

export type ProcessTransactionMessage = InferType<typeof processTransactionMessageSchema>;

export const parseAndValidateProcessTransactionMessage = (
    processTransctionMessageBody: unknown
): ProcessTransactionMessage => {
    return parseAndValidate(
        processTransctionMessageBody,
        processTransactionMessageSchema,
        'Could not parse the process transaction message body. Unknown Reason.'
    );
};
