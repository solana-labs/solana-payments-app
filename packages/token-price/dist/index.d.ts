declare enum TokenPriceProvider {
    JUPITER = "jupiter"
}
interface TokenPriceInfo {
    mint: string;
    symbol: string;
    vsTokenMint: string;
    vsTokenSymbol: string;
    price: number;
    provider: TokenPriceProvider;
}
declare const buildPriceEndpoint: (tokens: string[], vsToken: string, vsAmount: number | null) => string;
declare const getPrices: (tokens: string[], vsAmount?: number | null, vsToken?: string) => Promise<TokenPriceInfo[]>;

export { TokenPriceInfo, TokenPriceProvider, buildPriceEndpoint, getPrices };
