import { object, string, InferType, number } from 'yup';
import { parseAndValidate } from '../utilities/yup.utility.js';
export const messageQueuePayloadScheme = object().shape({
    recordId: string().required(),
    recordType: string().required(),
    seconds: number().required(),
});

export type MessageQueuePayload = InferType<typeof messageQueuePayloadScheme>;

export const parseAndValidateMessageQueuePayload = (messageQueueBody: unknown): MessageQueuePayload => {
    return parseAndValidate(
        messageQueueBody,
        messageQueuePayloadScheme,
        'Could not parse the message queue body. Unknown Reason.'
    );
};
