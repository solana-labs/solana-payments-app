import { object, string, InferType } from 'yup';

import { parseAndValidate } from '../utilities/yup.utility.js';
export const sqsMessageSchema = object().shape({
    messageType: string().required(),
    messagePayload: string().required(),
});

export type SQSMessage = InferType<typeof sqsMessageSchema>;

export const parseAndValidateSQSMessage = (sqsMessageBody: unknown): SQSMessage => {
    return parseAndValidate(sqsMessageBody, sqsMessageSchema, 'Could not parse the sqs message body. Unknown Reason.');
};
