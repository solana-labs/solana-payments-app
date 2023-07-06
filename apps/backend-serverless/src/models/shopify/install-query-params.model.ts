import { InferType, object, string } from 'yup';
import { parseAndValidate } from '../../utilities/yup.utility.js';

// export const appInstallQueryParmSchema = object().shape({
//     hmac: string().optional(),
//     shop: string()
//         .test('shop', 'Invalid shop', value =>
//             process.env.NODE_ENV === 'development'
//                 ? (value && /[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com\/?/.test(value)) || value === 'localhost:4004'
//                 : /[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com\/?/.test(value)
//         )
//         .required(),
//     host: string().required(),
//     timestamp: string().required(),
// });

export const appInstallQueryParmSchema = object().shape({
    hmac: string().optional(), // optional for the purpose of validation. i should do an extra check here or make a new structure
    shop: string()
        .test('shop', 'Invalid shop', (value: string | undefined) => {
            if (typeof value === 'undefined') {
                return false;
            } else if (process.env.NODE_ENV === 'development') {
                console.log('in devleopment node env shop');
                return value === 'localhost:4004';
            } else {
                console.log('in not development node env shop');
                return /[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com\/?/.test(value);
            }
        })
        .required(),
    host: string().required(),
    timestamp: string().required(),
});

export type AppInstallQueryParam = InferType<typeof appInstallQueryParmSchema>;

export const parseAndValidateAppInstallQueryParms = (appInstallQuery: unknown): AppInstallQueryParam => {
    return parseAndValidate(
        appInstallQuery,
        appInstallQueryParmSchema,
        'Could not parse the app install query. Unknown Reason.'
    );
};
