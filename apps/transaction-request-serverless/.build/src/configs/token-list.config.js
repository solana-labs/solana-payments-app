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
import * as anchor from '@project-serum/anchor';
import { getMint } from '@solana/spl-token';
import { USDC_PUBKEY, WSOL_PUBKEY } from './pubkeys.config.js';
var TokenInformation = /** @class */ (function () {
    function TokenInformation(alias, pubkey, decimals) {
        this.alias = alias;
        this.pubkey = pubkey;
        this.decimals = decimals;
    }
    TokenInformation.prototype.convertSizeToQuantity = function (size) {
        var decimalMultiplier = Math.pow(10, this.decimals);
        var tokenQuantity = size * decimalMultiplier;
        return Math.floor(tokenQuantity);
    };
    TokenInformation.prototype.convertQuantityToSize = function (quantity) {
        var decimalMultiplier = Math.pow(10, this.decimals);
        var tokenSize = quantity / decimalMultiplier;
        return tokenSize;
    };
    TokenInformation.queryTokenInformationFromPubkey = function (pubkey, connection) {
        return __awaiter(this, void 0, void 0, function () {
            var mint, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, getMint(connection, pubkey, 'confirmed')];
                    case 1:
                        mint = _b.sent();
                        return [2 /*return*/, new TokenInformation(mint.address.toBase58(), mint.address, mint.decimals)];
                    case 2:
                        _a = _b.sent();
                        throw new Error('Token does not exist.');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return TokenInformation;
}());
export { TokenInformation };
var TokenRegistry = /** @class */ (function () {
    function TokenRegistry() {
    }
    var _a;
    _a = TokenRegistry;
    TokenRegistry.isTokenAlias = function (name) {
        var token = _a.allTokens.find(function (token) {
            return token.alias == name;
        });
        return token != undefined;
    };
    TokenRegistry.getTokenFromAlias = function (input) {
        return TokenRegistry.allTokens.find(function (token) {
            return token.alias == input;
        });
    };
    TokenRegistry.getTokenFromPubkey = function (input) {
        return TokenRegistry.allTokens.find(function (token) {
            return token.pubkey == input;
        });
    };
    TokenRegistry.getTokenFromPubkeyString = function (input) {
        return TokenRegistry.allTokens.find(function (token) {
            return token.pubkey.toBase58() == input;
        });
    };
    TokenRegistry.queryTokenInformation = function (input, connection) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(_a, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!(connection != undefined)) return [3 /*break*/, 2];
                    return [4 /*yield*/, TokenInformation.queryTokenInformationFromPubkey(new anchor.web3.PublicKey(input), connection)];
                case 1: return [2 /*return*/, _b.sent()];
                case 2: return [2 /*return*/];
            }
        });
    }); };
    TokenRegistry.allTokens = [
        new TokenInformation('usdc', USDC_PUBKEY, 6),
        new TokenInformation('sol', WSOL_PUBKEY, 9),
    ];
    return TokenRegistry;
}());
export { TokenRegistry };
//# sourceMappingURL=token-list.config.js.map