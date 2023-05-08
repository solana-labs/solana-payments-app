import { object, string, InferType, array } from 'yup'
export const resolveRefundResponseStateSchema = object().shape({
    code: string().required(),
})

export const resolveRefundResponseRefundSessionSchema = object().shape({
    id: string().required(),
    state: resolveRefundResponseStateSchema.required(),
})

export const resolveRefundResponseRefundSessionResolveSchema = object().shape({
    refundSession: resolveRefundResponseRefundSessionSchema.required(),
    userErrors: array().of(string()).required(),
})

export const resolveRefundResponseDataSchema = object().shape({
    refundSessionResolve:
        resolveRefundResponseRefundSessionResolveSchema.required(),
    userErrors: array().of(string()).optional(),
})

export const resolveRefundResponseSchema = object().shape({
    data: resolveRefundResponseDataSchema.required(),
})

export type ResolveRefundResponse = InferType<
    typeof resolveRefundResponseSchema
>

export const parseAndValidateResolveRefundResponse = (
    resolveRefundResponeBody: any
): ResolveRefundResponse => {
    let parsedResolveRefundResponse: ResolveRefundResponse
    try {
        parsedResolveRefundResponse = resolveRefundResponseSchema.cast(
            resolveRefundResponeBody
        ) as ResolveRefundResponse
    } catch (error) {
        if (error instanceof Error) {
            throw error
        } else {
            throw new Error(
                'Could not parse the resolve refund response body. Unknown Reason.'
            )
        }
    }
    return parsedResolveRefundResponse
}
