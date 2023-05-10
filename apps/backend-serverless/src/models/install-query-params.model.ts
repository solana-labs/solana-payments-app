import { object, string, InferType } from 'yup'
import { parseAndValidate } from '../utilities/yup.utility.js'
export const appInstallQueryParmSchema = object().shape({
    hmac: string().optional(), // optional for the purpose of validation. i should do an extra check here or make a new structure
    shop: string()
        .matches(/^https?\:\/\/[a-zA-Z0-9][a-zA-Z0-9\-]*\.myshopify\.com\/?/)
        .required(),
    host: string().required(),
    timestamp: string().required(),
})

export type AppInstallQueryParam = InferType<typeof appInstallQueryParmSchema>

export const parseAndValidateAppInstallQueryParms = (
    appInstallQuery: unknown
): AppInstallQueryParam => {
    return parseAndValidate(
        appInstallQuery,
        appInstallQueryParmSchema,
        'Could not parse the app install query. Unknown Reason.'
    )
}
