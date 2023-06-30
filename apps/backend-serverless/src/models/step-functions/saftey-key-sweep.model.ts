import { InferType, object, string } from 'yup';
import { parseAndValidateStrict } from '../../utilities/yup.utility.js';

export const safteyKeyMessageSchema = object().shape({
    key: string().required(),
});

export type SafteyKeyMessage = InferType<typeof safteyKeyMessageSchema>;

export const parseAndValidateSafteyKeyMessage = (safteyKeyMessageBody: unknown): SafteyKeyMessage => {
    return parseAndValidateStrict(
        safteyKeyMessageBody,
        safteyKeyMessageSchema,
        'Could not parse the saftey key message. Unknown Reason.'
    );
};
