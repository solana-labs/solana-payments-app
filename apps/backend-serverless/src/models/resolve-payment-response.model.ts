import { object, string, InferType, array } from 'yup'

export const resolvePaymentResponseThrottleStatusSchema = object().shape({
    maximumAvailable: string().optional(),
    currentlyAvailable: string().optional(),
    restoreRate: string().optional(),
})

export const resolvePaymentResponseCostSchema = object().shape({
    requestedQueryCost: string().optional(),
    actualQueryCost: string().optional(),
    throttleStatus: resolvePaymentResponseThrottleStatusSchema.optional(),
})

export const resolvePaymentResponseStateSchema = object().shape({
    code: string().required(),
})

export const resolvePaymentResponseContextSchema = object().shape({
    redirectUrl: string().required(),
})

export const resolvePaymentResponseNextActionSchema = object().shape({
    action: string().required(),
    context: resolvePaymentResponseContextSchema.optional(),
})

export const resolvePaymentResponsePaymentSessionSchema = object().shape({
    id: string().required(),
    state: resolvePaymentResponseStateSchema.optional(),
    nextAction: resolvePaymentResponseNextActionSchema.optional(),
})

export const resolvePaymentResponseExtensionsSchema = object().shape({
    cost: resolvePaymentResponseCostSchema.required(),
})

export const resolvePaymentResponsePaymentSessionResolveSchema = object().shape(
    {
        paymentSession: resolvePaymentResponsePaymentSessionSchema.required(),
        userErrors: array().of(string()).required(),
    }
)

export const resolvePaymentResponseDataSchema = object().shape({
    paymentSessionResolve:
        resolvePaymentResponsePaymentSessionResolveSchema.required(),
})

export const resolvePaymentResponseSchema = object().shape({
    data: resolvePaymentResponseDataSchema.required(),
    extensions: resolvePaymentResponseExtensionsSchema.required(),
})

export type ResolvePaymentResponse = InferType<
    typeof resolvePaymentResponseSchema
>

export const parseAndValidateResolvePaymentResponse = (
    resolvePaymentResponeBody: any
): ResolvePaymentResponse => {
    let parsedPaymentInitiationRequestBody: ResolvePaymentResponse
    try {
        parsedPaymentInitiationRequestBody = resolvePaymentResponseSchema.cast(
            resolvePaymentResponeBody
        ) as ResolvePaymentResponse
    } catch (error) {
        if (error instanceof Error) {
            throw error
        } else {
            throw new Error(
                'Could not parse the resolve payment response body. Unknown Reason.'
            )
        }
    }
    return parsedPaymentInitiationRequestBody
}
