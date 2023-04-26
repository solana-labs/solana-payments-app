import { PrismaClient } from '@prisma/client';
import { APIGatewayProxyEventV2, APIGatewayProxyResult } from 'aws-lambda';
import { withAuth } from '../../utilities/token-authenticate.utility.js';
import { RefundRecordService } from '../../services/database/refund-record-service.database.service.js';
import { MerchantService } from '../../services/database/merchant-service.database.service.js';
import { requestErrorResponse } from '../../utilities/request-response.utility.js';

const prisma = new PrismaClient();
export const refundData = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResult> => {
  const shopId = withAuth(event);

  const merchantService = new MerchantService(prisma);
  const refundRecordService = new RefundRecordService(prisma);

  try {
    const merchant = await merchantService.getMerchant({
      id: Number(shopId),
    });

    const refundRecords = await refundRecordService.getRefundRecordsForMerchant(
      {
        id: merchant!.id,
      }
    );

    if (merchant == null) {
      throw new Error('Merchant not found.');
    }

    console.log('merchant', merchant);
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        {
          message: `Merchant info for shopId: ${shopId}, shop: ${merchant.shop}`,
          refundRecords: refundRecords,
        },
        null,
        2
      ),
    };
  } catch (error: unknown) {
    return requestErrorResponse(error);
  }
};
