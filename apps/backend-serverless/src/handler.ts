import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const hello = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    return {
        statusCode: 200,
        body: JSON.stringify(
            {
                merchants: 'ripper..',
            },
            null,
            2
        ),
    }
}
