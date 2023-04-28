import { web3 } from "@project-serum/anchor";
import { Request, Response } from "express";
import {
  PayRequest,
  createPayTransaction,
  createSamplePayRequest,
} from "transaction-builder";

export const payController = async (request: Request, response: Response) => {
  let payRequest: PayRequest;

  // console.log(request.body.account)

  try {
    payRequest = PayRequest.parse({
      receiver: request.query.receiver,
      sender: request.body.account,
      sendingToken: request.query.sendingToken,
      receivingToken: request.query.receivingToken,
      feePayer: request.query.feePayer,
      receivingAmount: request.query.receivingAmount,
      amountType: request.query.amountType,
      transactionType: request.query.transactionType,
      createAta: request.query.createAta,
    });
  } catch (error) {
    response.send(JSON.stringify({ error: (error as Error).message }));
    return;
  }

  const transaction = await createPayTransaction(payRequest);

  const base = transaction
    .serialize({ requireAllSignatures: false, verifySignatures: false })
    .toString("base64");

  response.send({
    transaction: base,
    message: "messag",
  });

  // console.log(transaction.instructions[0].programId.toBase58())

  const connection = new web3.Connection(
    "https://rpc.helius.xyz/?api-key=5f70b753-57cb-422b-a018-d7df67b4470e"
  );

  const tx = await connection.simulateTransaction(transaction);
};

const grabKeypairFromS3 = (): web3.Keypair => {
  // grab keypair from s3
  // grab the bytes
  return web3.Keypair.generate();
};
