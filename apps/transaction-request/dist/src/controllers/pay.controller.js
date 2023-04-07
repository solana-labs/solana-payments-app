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
const transaction_builder_1 = require("transaction-builder");
const payController = (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    let payRequest;
    try {
        payRequest = (0, transaction_builder_1.createSamplePayRequest)();
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
        message: 'message',
    });
});
exports.payController = payController;
