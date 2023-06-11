import { InferType, object, string } from 'yup';
import { parseAndValidate } from '../../utilities/yup.utility.js';

export const heliusHeaderSchema = object().shape({
    authorization: string().required(),
});

export type HeliusHeader = InferType<typeof heliusHeaderSchema>;

export const parseAndValidateHeliusHeader = (heliusHeaderBody: unknown): HeliusHeader => {
    return parseAndValidate(
        heliusHeaderBody,
        heliusHeaderSchema,
        'Could not parse the heluis header body. Unknown Reason.'
    );
};
