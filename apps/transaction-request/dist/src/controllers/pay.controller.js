"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.payController = void 0;
const anchor_1 = require("@project-serum/anchor");
const transaction_builder_1 = require("transaction-builder");
const payController = (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    let payRequest;
    // console.log(request.body.account)
    try {
        payRequest = transaction_builder_1.PayRequest.parse({
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
    }
    catch (error) {
        response.send(JSON.stringify({ error: error.message }));
        return;
    }
    const transaction = yield (0, transaction_builder_1.createPayTransaction)(payRequest);
    const base = transaction
        .serialize({ requireAllSignatures: false, verifySignatures: false })
        .toString('base64');
    response.send({
        transaction: base,
        message: 'messag',
    });
    // console.log(transaction.instructions[0].programId.toBase58())
    const connection = new anchor_1.web3.Connection('https://rpc.helius.xyz/?api-key=5f70b753-57cb-422b-a018-d7df67b4470e');
    const tx = yield connection.simulateTransaction(transaction);
});
exports.payController = payController;
const grabKeypairFromS3 = () => {
    // grab keypair from s3
    // grab the bytes
    return anchor_1.web3.Keypair.generate();
};
