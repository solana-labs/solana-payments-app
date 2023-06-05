var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { object, string, boolean, number } from 'yup';
import { parseAndValidate } from '../utils/yup.util.js';
import { web3 } from '@project-serum/anchor';
import { TokenInformation } from '../configs/token-list.config.js';
import { createSwapIx } from '../services/swaps/create-swap-ix.service.js';
import { createTransferIx } from '../services/builders/transfer-ix.builder.js';
import { createAccountIx } from '../services/builders/create-account-ix.builder.js';
import { createIndexingIx } from '../services/builders/create-index-ix.builder.js';
var publicKeySchema = string().test('is-public-key', 'Invalid public key', function (value) {
    if (value === undefined) {
        return false;
    }
    try {
        new web3.PublicKey(value);
        return true;
    }
    catch (err) {
        return false;
    }
});
export var TransactionType;
(function (TransactionType) {
    TransactionType["blockhash"] = "blockhash";
    TransactionType["nonce"] = "nonce";
})(TransactionType || (TransactionType = {}));
export var AmountType;
(function (AmountType) {
    AmountType["size"] = "size";
    AmountType["quantity"] = "quantity";
})(AmountType || (AmountType = {}));
export var paymentTransactionRequestScheme = object().shape({
    receiver: publicKeySchema.required(),
    sendingToken: publicKeySchema.required(),
    receivingToken: publicKeySchema.required(),
    feePayer: publicKeySchema.required(),
    receivingAmount: number().required(),
    amountType: string().oneOf(Object.values(AmountType), 'Invalid amount type.').default(AmountType.size).required(),
    transactionType: string()
        .oneOf(Object.values(TransactionType), 'Invalid transaction type')
        .default(TransactionType.blockhash)
        .required(),
    createAta: boolean().default(true).required(),
    singleUseNewAcc: publicKeySchema.nullable(),
    singleUsePayer: publicKeySchema.nullable(),
    indexInputs: string().nullable(),
    // .required()
    // .test(
    //     'is-comma-separated-no-spaces',
    //     'indexInputs must be a comma separated string with no spaces in individual strings',
    //     value => {
    //         if (typeof value !== 'string') return false;
    //         // TODO: There is some limit to what these input strings can be, figure out what it is
    //         // and validate that constraint here
    //         // Check if every part of the split string is non-empty and does not contain spaces
    //         return value.split(',').every(substring => {
    //             return substring.length > 0 && !substring.includes(' ');
    //         });
    //     }
    // ),
});
export var parseAndValidatePaymentTransactionRequest = function (paymentTransactionRequestParams) {
    return parseAndValidate(paymentTransactionRequestParams, paymentTransactionRequestScheme, 'Invalid payment transaction request');
};
var PaymentTransactionBuilder = /** @class */ (function () {
    function PaymentTransactionBuilder(paymentTransactionRequest) {
        this.sender = new web3.PublicKey(paymentTransactionRequest.sender);
        this.receiver = new web3.PublicKey(paymentTransactionRequest.receiver);
        this.sendingToken = new web3.PublicKey(paymentTransactionRequest.sendingToken);
        this.receivingToken = new web3.PublicKey(paymentTransactionRequest.receivingToken);
        this.feePayer = new web3.PublicKey(paymentTransactionRequest.feePayer);
        this.receivingAmount = paymentTransactionRequest.receivingAmount;
        this.amountType = paymentTransactionRequest.amountType;
        this.transactionType = paymentTransactionRequest.transactionType;
        this.createAta = paymentTransactionRequest.createAta;
        this.singleUseNewAcc = paymentTransactionRequest.singleUseNewAcc
            ? new web3.PublicKey(paymentTransactionRequest.singleUseNewAcc)
            : null;
        this.singleUsePayer = paymentTransactionRequest.singleUsePayer
            ? new web3.PublicKey(paymentTransactionRequest.singleUsePayer)
            : null;
        this.indexInputs = paymentTransactionRequest.indexInputs
            ? paymentTransactionRequest.indexInputs.split(',')
            : null;
    }
    PaymentTransactionBuilder.prototype.buildPaymentTransaction = function (connection) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, receivingQuantity, swapIxs, transferIxs, createIxs, indexIxs, blockhash, receivingTokenInformation;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        swapIxs = [];
                        transferIxs = [];
                        createIxs = [];
                        indexIxs = [];
                        return [4 /*yield*/, connection.getLatestBlockhash()];
                    case 1:
                        blockhash = _a.sent();
                        switch (this.transactionType) {
                            case TransactionType.blockhash:
                                transaction = new web3.Transaction({
                                    feePayer: this.feePayer,
                                    blockhash: blockhash.blockhash,
                                    lastValidBlockHeight: blockhash.lastValidBlockHeight,
                                });
                            case TransactionType.nonce:
                                transaction = new web3.Transaction({
                                    feePayer: this.feePayer,
                                    blockhash: blockhash.blockhash,
                                    lastValidBlockHeight: blockhash.lastValidBlockHeight,
                                });
                        }
                        return [4 /*yield*/, TokenInformation.queryTokenInformationFromPubkey(this.receivingToken, connection)];
                    case 2:
                        receivingTokenInformation = _a.sent();
                        switch (this.amountType) {
                            case AmountType.quantity:
                                receivingQuantity = this.receivingAmount;
                                break;
                            case AmountType.size:
                                receivingQuantity = receivingTokenInformation.convertSizeToQuantity(this.receivingAmount);
                                break;
                        }
                        if (!(this.sendingToken.toBase58() != this.receivingToken.toBase58())) return [3 /*break*/, 4];
                        return [4 /*yield*/, createSwapIx({
                                provider: 'jupiter',
                                quantity: receivingQuantity,
                                fromMint: this.sendingToken,
                                toMint: this.receivingToken,
                                swapingWallet: this.sender,
                            })];
                    case 3:
                        swapIxs = _a.sent();
                        _a.label = 4;
                    case 4: return [4 /*yield*/, createTransferIx(this.sender, this.receiver, receivingTokenInformation, receivingQuantity, this.createAta, connection)];
                    case 5:
                        transferIxs = _a.sent();
                        if (!(this.singleUseNewAcc && this.singleUsePayer)) return [3 /*break*/, 7];
                        return [4 /*yield*/, createAccountIx(this.singleUseNewAcc, this.singleUsePayer, connection)];
                    case 6:
                        createIxs = _a.sent();
                        _a.label = 7;
                    case 7:
                        if (!(this.indexInputs && this.indexInputs.length > 0)) return [3 /*break*/, 9];
                        return [4 /*yield*/, createIndexingIx(this.feePayer, this.indexInputs)];
                    case 8:
                        indexIxs = _a.sent();
                        _a.label = 9;
                    case 9:
                        transaction = transaction.add.apply(transaction, __spreadArray(__spreadArray(__spreadArray(__spreadArray([], createIxs, false), swapIxs, false), transferIxs, false), indexIxs, false));
                        return [2 /*return*/, transaction];
                }
            });
        });
    };
    return PaymentTransactionBuilder;
}());
export { PaymentTransactionBuilder };
//# sourceMappingURL=payment-transaction-request.model.js.map