export var JUPITER_URL = 'https://quote-api.jup.ag/v4';
export var createJupiterQuoteRequestUrl = function (quantity, fromMint, toMint) {
    var jupiterQuoteUrl = "".concat(JUPITER_URL, "/quote?inputMint=").concat(fromMint, "&outputMint=").concat(toMint, "&amount=").concat(quantity, "&slippageBps=10&swapMode=ExactOut");
    return jupiterQuoteUrl;
};
//# sourceMappingURL=jupiter.util.js.map