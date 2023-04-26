import { PrismaClient } from '@prisma/client';
import {
  APIGatewayProxyEvent,
  APIGatewayProxyEventV2,
  APIGatewayProxyResult,
} from 'aws-lambda';
import { withAuth } from '../../utilities/token-authenticate.utility.js';
import { MerchantService } from '../../services/database/merchant-service.database.service.js';
import { TransactionRecordService } from '../../services/database/transaction-record-service.database.service.js';
import { requestErrorResponse } from '../../utilities/request-response.utility.js';

const prisma = new PrismaClient();

export const transactionData = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResult> => {
  const shopId = withAuth(event);
  const merchantService = new MerchantService(prisma);
  const transactionRecordService = new TransactionRecordService(prisma);

  try {
    const merchant = await merchantService.getMerchant({
      id: Number(shopId),
    });

    const transactionRecords =
      await transactionRecordService.getTransactionRecordsForMerchant({
        id: merchant!.id,
      });

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
          transactionRecords: transactionRecords,
        },
        null,
        2
      ),
    };
  } catch (error: unknown) {
    return requestErrorResponse(error);
  }
};
