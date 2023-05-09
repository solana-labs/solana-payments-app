import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import {
    ShopifyPaymentInitiation,
    parseAndValidateShopifyPaymentInitiation,
} from '../models/process-payment-request.model.js'
import { requestErrorResponse } from '../utilities/request-response.utility.js'
import { PrismaClient, PaymentRecord } from '@prisma/client'
import { PaymentRecordService } from '../services/database/payment-record-service.database.service.js'

export const payment = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    const prisma = new PrismaClient()

    let paymentRecordService = new PaymentRecordService(prisma)

    if (event.body == null) {
        return requestErrorResponse(new Error('Missing body.'))
    }

    const merchantShop = event.headers['shopify-shop-domain']

    let paymentInitiation: ShopifyPaymentInitiation

    try {
        paymentInitiation = parseAndValidateShopifyPaymentInitiation(
            JSON.parse(event.body)
        )
    } catch (error) {
        return requestErrorResponse(error)
    }

    let paymentRecord: PaymentRecord | null

    try {
        const merchant = await prisma.merchant.findUniqueOrThrow({
            where: {
                shop: merchantShop,
            },
        })

        paymentRecord = await prisma.paymentRecord.findFirst({
            where: {
                shopId: paymentInitiation.id,
            },
        })

        if (paymentRecord == null) {
            paymentRecord = await paymentRecordService.createPaymentRecord(
                paymentInitiation,
                merchant
            )
        }
    } catch (error: unknown) {
        console.log(error)
        return requestErrorResponse(error)
    }

    const paymentUiUrl = process.env.PAYMENT_UI_URL

    if (paymentUiUrl == null) {
        return {
            statusCode: 500,
            body: JSON.stringify(
                {
                    message: 'Missing information.',
                },
                null,
                2
            ),
        }
    }

    return {
        statusCode: 200,
        body: JSON.stringify(
            {
                redirect_url: paymentUiUrl + '?paymentId=' + paymentRecord.id,
            },
            null,
            2
        ),
    }
}
