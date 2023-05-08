import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import {
  PrismaClient,
  PaymentRecord,
  RefundRecord,
  Merchant,
} from "@prisma/client";
import { requestErrorResponse } from "../utilities/request-response.utility.js";
import {
  ShopifyRequestHeaders,
  parseAndValidateShopifyRequestHeaders,
} from "../models/shopify-request-headers.model.js";
import {
  ShopifyRefundInitiation,
  parseAndValidateShopifyRefundInitiation,
} from "../models/process-refund.request.model.js";

export const refund = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const prisma = new PrismaClient();

  if (event.body == null) {
    return requestErrorResponse(new Error("Missing body."));
  }

  let requestHeaders: ShopifyRequestHeaders;

  try {
    requestHeaders = parseAndValidateShopifyRequestHeaders(event.headers);
  } catch (error) {
    return requestErrorResponse(error);
  }

  let refundInitiation: ShopifyRefundInitiation;

  try {
    refundInitiation = parseAndValidateShopifyRefundInitiation(event.body);
  } catch (error) {
    return requestErrorResponse(error);
  }

  let paymentRecord: PaymentRecord | null;
  let merchant: Merchant | null;
  let existingRefundRecord: RefundRecord | null;

  try {
    paymentRecord = await prisma.paymentRecord.findFirst({
      where: {
        shopId: refundInitiation.payment_id,
      },
    });

    if (paymentRecord == null) {
      throw new Error("Payment record not found.");
    }

    merchant = await prisma.merchant.findFirst({
      where: {
        shop: requestHeaders["shopify-shop-domain"],
      },
    });

    if (merchant == null) {
      throw new Error("Merchant not found.");
    }

    existingRefundRecord = await prisma.refundRecord.findFirst({
      where: {
        shopId: refundInitiation.id,
      },
    });
  } catch (error) {
    return requestErrorResponse(error);
  }

  // This is a request we have previously seen from shopify and we should return 201 as if it was created for idempotency
  if (existingRefundRecord != null) {
    return {
      statusCode: 201,
      body: JSON.stringify({}, null, 2),
    };
  }

  let refundRecord: RefundRecord;

  try {
    refundRecord = await prisma.refundRecord.create({
      data: {
        status: "pending",
        amount: refundInitiation.amount,
        currency: refundInitiation.currency,
        shopId: refundInitiation.id,
        shopGid: refundInitiation.gid,
        shopPaymentId: refundInitiation.payment_id,
        test: refundInitiation.test,
        merchantId: merchant.id,
      },
    });
  } catch (error) {
    return requestErrorResponse(error);
  }

  if (refundRecord == null) {
    return requestErrorResponse(new Error("Refund record not created."));
  }

  // We return 201 status code here per shopify's documentation: https://shopify.dev/docs/apps/payments/implementation/process-a-refund#initiate-the-flow
  return {
    statusCode: 201,
    body: JSON.stringify({}, null, 2),
  };
};
