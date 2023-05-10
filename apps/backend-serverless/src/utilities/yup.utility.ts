import { AnySchema } from 'yup'

export const parseAndValidate = <T>(
    data: unknown,
    schema: AnySchema,
    errorMessage: string
): T => {
    let parsedData: T
    try {
        schema.validateSync(data)
        parsedData = schema.cast(data) as T
    } catch (error) {
        if (error instanceof Error) {
            throw error
        } else {
            throw new Error(errorMessage)
        }
    }
    return parsedData
}
