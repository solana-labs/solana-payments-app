import { z } from 'zod'

export const stringifiedNumberSchema = () =>
    z
        .string()
        .transform(parseFloat)
        .refine((value) => !isNaN(value) && isFinite(value), {
            message: 'Input must be a valid number in string format',
        })
