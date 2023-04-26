import { PrismaClient } from '@prisma/client';
import {
  APIGatewayProxyEvent,
  APIGatewayProxyEventV2,
  APIGatewayProxyResult,
} from 'aws-lambda';
import {
  AuthenticatedAPIGatewayProxyEvent,
  withAuth,
} from '../../utilities/token-authenticate.utility.js';
import { PaymentRecordService } from '../../services/database/payment-record-service.database.service.js';
import { MerchantService } from '../../services/database/merchant-service.database.service.js';
import { requestErrorResponse } from '../../utilities/request-response.utility.js';

const prisma = new PrismaClient();

export async function merchantData(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResult> {
  const shopId = withAuth(event);

  const merchantService = new MerchantService(prisma);
  const paymentRecordService = new PaymentRecordService(prisma);

  try {
    const merchant = await merchantService.getMerchant({ id: Number(shopId) });

    const paymentRecords =
      await paymentRecordService.getPaymentRecordsForMerchant({
        id: merchant!.id,
      });

    if (merchant == null) {
      throw new Error('Merchant not found.');
    }

    console.log('merchant', merchant);
    console.log('paymentRecords', paymentRecords);
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        {
          message: `Merchant info for shopId: ${shopId}, shop: ${merchant.shop}`,
          paymentRecords: paymentRecords,
        },
        null,
        2
      ),
    };
  } catch (error: unknown) {
    return requestErrorResponse(error);
  }
}
