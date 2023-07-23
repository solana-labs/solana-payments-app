import { InferType, object, string } from 'yup';
import { parseAndValidateStrict } from '../../utilities/yup.utility';

export const safetyKeyMessageSchema = object().shape({
    key: string().required(),
});

export type SafetyKeyMessage = InferType<typeof safetyKeyMessageSchema>;

export const parseAndValidateSafetyKeyMessage = (safetyKeyMessageBody: unknown): SafetyKeyMessage => {
    return parseAndValidateStrict(
        safetyKeyMessageBody,
        safetyKeyMessageSchema,
        'Could not parse the safety key message. Unknown Reason.'
    );
};
