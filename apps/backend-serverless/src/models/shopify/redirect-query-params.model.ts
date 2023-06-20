import { object, string, InferType } from 'yup';
import { parseAndValidate } from '../../utilities/yup.utility.js';

export const appRedirectQueryParmSchema = object().shape({
    code: string().required(),
    hmac: string().optional(), // optional for the purpose of validation. i should do an extra check here or make a new structure
    shop: string()
        // .matches(/[a-zA-Z0-9][a-zA-Z0-9\-]*\.myshopify\.com\/?/) add back and figure out another solution for local: TODO
        .required(),
    host: string().required(),
    state: string().required(),
    timestamp: string().required(),
});

export type AppRedirectQueryParam = InferType<typeof appRedirectQueryParmSchema>;

export const parseAndValidateAppRedirectQueryParams = (appRedirectQuery: unknown): AppRedirectQueryParam => {
    return parseAndValidate(
        appRedirectQuery,
        appRedirectQueryParmSchema,
        'Could not parse the app install query. Unknown Reason.'
    );
};
