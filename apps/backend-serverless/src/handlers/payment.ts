import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import {
    ShopifyPaymentInitiation,
    parseAndValidateShopifyPaymentInitiation,
} from '../models/process-payment-request.model.js'
import { requestErrorResponse } from '../utilities/request-response.utility.js'
import { PrismaClient, PaymentRecord } from '@prisma/client'

export const payment = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    // the first thing I want to do is parse the body of the request
    // then i can take that info and determine if i need to
    // 1. create a new PaymentRecord
    // 2. reuse an existing PaymentRecord

    const prisma = new PrismaClient()

    if (event.body == null) {
        return requestErrorResponse(new Error('Missing body.'))
    }

    const merchantShop = event.headers['shopify-shop-domain']

    console.log('shop domaine')
    console.log(merchantShop)
    console.log(event.headers)

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
            paymentRecord = await prisma.paymentRecord.create({
                data: {
                    status: 'pending',
                    shopId: paymentInitiation.id,
                    shopGid: paymentInitiation.gid,
                    shopGroup: paymentInitiation.group,
                    test: paymentInitiation.test,
                    amount: paymentInitiation.amount,
                    currency: paymentInitiation.currency,
                    customerAddress: null,
                    merchantId: merchant.id,
                },
            })
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
                redirect_url: paymentUiUrl + '?payment_id=' + paymentRecord.id,
            },
            null,
            2
        ),
    }
}
