import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { PaymentRecord, PrismaClient, TransactionType } from "@prisma/client";
import { requestErrorResponse } from "../utilities/request-response.utility.js";
import { TransactionRequestResponse } from "../models/transaction-request-response.model.js";
import { fetchPaymentTransaction } from "../services/fetch-payment-transaction.service.js";
import {
  PaymentTransactionRequest,
  parseAndValidatePaymentTransactionRequest,
} from "../models/payment-transaction-request.model.js";
// import { decode, encodeBufferToBase58 } from '../utilities/string.utility.js'
import { encodeBufferToBase58 } from "../utilities/encode-transaction.utility.js";
import { decode } from "../utilities/string.utility.js";
import queryString from "query-string";
import { encodeTransaction } from "../utilities/encode-transaction.utility.js";
import { web3 } from "@project-serum/anchor";
import { fetchGasKeypair } from "../services/fetch-gas-keypair.service.js";
import { table } from "console";
const prisma = new PrismaClient();

export const paymentTransaction = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  let paymentRecord: PaymentRecord;
  let paymentTransaction: TransactionRequestResponse;
  let paymentRequest: PaymentTransactionRequest;
  let transaction: web3.Transaction;

  const decodedBody = event.body ? decode(event.body) : "";
  const body = queryString.parse(decodedBody);
  const account = body["account"] as string | null;

  if (account == null) {
    return requestErrorResponse(new Error("No account provided."));
  }

  try {
    paymentRequest = parseAndValidatePaymentTransactionRequest(
      event.queryStringParameters
    );
  } catch (error) {
    return requestErrorResponse(error);
  }

  const gasKeypair = await fetchGasKeypair();

  try {
    paymentRecord = await prisma.paymentRecord.findFirstOrThrow({
      where: {
        id: paymentRequest.paymentId,
      },
    });
  } catch (error) {
    return requestErrorResponse(error);
  }

  try {
    paymentTransaction = await fetchPaymentTransaction(
      paymentRecord,
      account,
      gasKeypair.publicKey.toBase58()
    );
  } catch (error) {
    return requestErrorResponse(error);
  }

  try {
    transaction = encodeTransaction(paymentTransaction.transaction);
  } catch (error) {
    return requestErrorResponse(error);
  }

  transaction.sign(gasKeypair);
  const transactionSignature = transaction.signature;

  if (transactionSignature == null) {
    return requestErrorResponse(new Error("No transaction signature."));
  }

  const signatureBuffer = transactionSignature;

  const signatureString = encodeBufferToBase58(signatureBuffer);

  try {
    await prisma.transactionRecord.create({
      data: {
        signature: signatureString,
        type: TransactionType.payment,
        paymentRecordId: paymentRecord.id,
        createdAt: "fake-date-go-here",
      },
    });
  } catch (error) {
    return requestErrorResponse(error);
  }

  const transactionBuffer = transaction.serialize({
    verifySignatures: false,
    requireAllSignatures: false,
  });
  const transactionString = transactionBuffer.toString("base64");

  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        transaction: transactionString,
        message: "gm",
      },
      null,
      2
    ),
  };
};

export const paymentMetadata = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        label: "Solana Payment App",
        icon: "https://solana.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FsolanaGradient.cc822962.png&w=3840&q=75",
      },
      null,
      2
    ),
  };
};
