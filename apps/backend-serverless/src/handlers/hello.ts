import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { PrismaClient } from '@prisma/client'
import { requestErrorResponse } from './utilities/request-response.utility.js'

const prisma = new PrismaClient()

export const hello = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    return {
        statusCode: 500,
        body: JSON.stringify(
            {
                event: event,
            },
            null,
            2
        ),
    }
}
