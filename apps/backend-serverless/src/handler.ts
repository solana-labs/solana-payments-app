import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { PrismaClient } from '@prisma/client'
import { requestErrorResponse } from './utilities/request-response.utility.js'

const prisma = new PrismaClient()

export const hello = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    const error = new Error('hello error')

    return requestErrorResponse(error)
}
