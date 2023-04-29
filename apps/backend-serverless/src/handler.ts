import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { PrismaClient, Merchant } from '@prisma/client'

const prisma = new PrismaClient()

export const hello = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    // const merchants = await prisma.merchant.findMany()

    return {
        statusCode: 200,
        body: JSON.stringify(
            {
                merchants: 'hello',
            },
            null,
            2
        ),
    }
}
