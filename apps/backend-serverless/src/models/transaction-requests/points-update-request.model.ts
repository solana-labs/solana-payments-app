import { InferType, number, object } from 'yup';
import { parseAndValidateStrict } from '../../utilities/yup.utility.js';
import { publicKeySchema } from '../public-key-schema.model.js';

export const pointsUpdateRequestBodySchema = object({
    back: number().required(),
    account: publicKeySchema.required(),
});

export type PointsUpdateRequest = InferType<typeof pointsUpdateRequestBodySchema>;

export const parseAndValidatePointsUpdateRequestBody = (pointsUpdateRequestBody: unknown): PointsUpdateRequest => {
    return parseAndValidateStrict(
        pointsUpdateRequestBody,
        pointsUpdateRequestBodySchema,
        'Could not parse the points update request body. Unknown Reason.'
    );
};
