import { InferType, object, string } from 'yup';
import { parseAndValidateStrict } from '../../utilities/yup.utility.js';

export const heliusHeaderSchema = object().shape({
    authorization: string().required(),
});

export type HeliusHeader = InferType<typeof heliusHeaderSchema>;

export const parseAndValidateHeliusHeader = (heliusHeaderBody: unknown): HeliusHeader => {
    return parseAndValidateStrict(
        heliusHeaderBody,
        heliusHeaderSchema,
        'Could not parse the heluis header body. Unknown Reason.'
    );
};
