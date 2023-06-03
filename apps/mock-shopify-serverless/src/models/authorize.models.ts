import { object, string, InferType, array } from 'yup';
import { parseAndValidate } from '../utilities/yup.utilities.js';

export const authorizeSchema = object().shape({
    client_id: string().required(),
    scope: string().required(),
    redirect_uri: string().required(),
    state: string().required(),
});

export type AuthorizeSchema = InferType<typeof authorizeSchema>;

export const parseAndValidateRejectPaymentResponse = (authorizeParameters: any): AuthorizeSchema => {
    return parseAndValidate(
        authorizeParameters,
        authorizeSchema,
        'Could not parse the authorize parameters. Unknown Reason.'
    );
};
