import axios from 'axios';

const BASE_JUPITER_PRICE_ENDPOINT = 'https://price.jup.ag/v4/price';

export enum TokenPriceProvider {
    JUPITER = 'jupiter',
}

export interface TokenPriceInfo {
    mint: string;
    symbol: string;
    vsTokenMint: string;
    vsTokenSymbol: string;
    price: number;
    provider: TokenPriceProvider;
}

const buildPriceEndpoint = (tokens: string[], vsToken: string, vsAmount: number | null): string => {
    // TODO: Filter tokens inputs, no commas, either has to be a whitelist value or a valid pubkey

    return `${BASE_JUPITER_PRICE_ENDPOINT}?ids=${tokens.join(',')}${
        vsAmount != null ? `&vsAmount=${vsAmount.toString()}` : ''
    }&vsToken=${vsToken}`;
};

const getPrices = async (
    tokens: string[],
    vsAmount: number | null = null,
    vsToken: string = 'USDC'
): Promise<TokenPriceInfo[]> => {
    const response = await axios.get(buildPriceEndpoint(tokens, vsToken, vsAmount));

    const tokenPrices = Object.values(response.data.data).map((responseObject: any) => {
        return {
            mint: responseObject.id,
            symbol: responseObject.mintSymbol,
            vsTokenMint: responseObject.vsToken,
            vsTokenSymbol: responseObject.vsTokenSymbol,
            price: responseObject.price,
            provider: TokenPriceProvider.JUPITER,
        } as TokenPriceInfo;
    });

    return tokenPrices;
};

export { getPrices, buildPriceEndpoint };
