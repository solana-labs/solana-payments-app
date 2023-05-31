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
import { PaymentTransactionBuilder, parseAndValidatePaymentTransactionRequest, } from '../models/payment-transaction-request.model.js';
import { decode } from '../utils/strings.util.js';
import queryString from 'querystring';
import { createConnection } from '../utils/connection.util.js';
export var pay = function (event) { return __awaiter(void 0, void 0, void 0, function () {
    var paymentTransactionRequest, decodedBody, body, account, queryParameters, transactionBuilder, connection, transaction, error_1, base;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log(event.body);
                decodedBody = event.body ? decode(event.body) : '';
                console.log('hello');
                body = queryString.parse(decodedBody);
                account = body['account'];
                if (account == null) {
                    return [2 /*return*/, {
                            statusCode: 500,
                            body: JSON.stringify({ error: body }, null, 2),
                        }];
                }
                if (event.queryStringParameters == null) {
                    return [2 /*return*/, {
                            statusCode: 500,
                            body: JSON.stringify({ message: 'no query' }, null, 2),
                        }];
                }
                queryParameters = event.queryStringParameters;
                queryParameters['sender'] = account;
                try {
                    paymentTransactionRequest = parseAndValidatePaymentTransactionRequest(queryParameters);
                }
                catch (error) {
                    return [2 /*return*/, {
                            statusCode: 500,
                            body: JSON.stringify(error, null, 2),
                        }];
                }
                transactionBuilder = new PaymentTransactionBuilder(paymentTransactionRequest);
                connection = createConnection();
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, transactionBuilder.buildPaymentTransaction(connection)];
            case 2:
                transaction = _a.sent();
                return [3 /*break*/, 4];
            case 3:
                error_1 = _a.sent();
                console.log(error_1);
                return [2 /*return*/, {
                        statusCode: 500,
                        body: JSON.stringify(error_1, null, 2),
                    }];
            case 4:
                base = transaction.serialize({ requireAllSignatures: false, verifySignatures: false }).toString('base64');
                return [2 /*return*/, {
                        statusCode: 200,
                        body: JSON.stringify({
                            transaction: base,
                            message: 'message sent',
                        }, null, 2),
                    }];
        }
    });
}); };
//# sourceMappingURL=pay.js.map