import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { requestErrorResponse } from '../utilities/request-response.utility.js'
import { PrismaClient } from '@prisma/client'

export const refund = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    const prisma = new PrismaClient()

    if (event.body == null) {
        return requestErrorResponse(new Error('Missing body.'))
    }

    const merchantShop = event.headers['shopify-shop-domain']

    return {
        statusCode: 201,
        body: JSON.stringify({}, null, 2),
    }
}
