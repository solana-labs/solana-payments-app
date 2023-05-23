import axios, { AxiosResponse } from 'axios';

const COIN_GECKO_USDC_ID = 'usd-coin';
const COIN_GECKO_API_BASE_URL = 'https://pro-api.coingecko.com';

// For our current curent purposes, we assume currency here is a three letter ISO 4217 currency code.
// This is the type of value we will get from Shopify and it's the type of value Coin Gecko expects
// TODO: Add axios dependency injection for testing
export const convertAmountAndCurrencyToUsdcSize = async (givenAmount: number, currency: string): Promise<number> => {
    const coinGeckoApiKey = process.env.COIN_GECKO_API_KEY;

    if (coinGeckoApiKey == null) {
        throw new Error('Coin Gecko API key not found');
    }

    const params = { ids: COIN_GECKO_USDC_ID, vs_currencies: currency, x_cg_pro_api_key: coinGeckoApiKey };
    try {
        const response: AxiosResponse = await axios.get(`${COIN_GECKO_API_BASE_URL}/api/v3/simple/price`, { params });
        if (response.status === 200) {
            const usdcPriceInGivenCurrency = response.data[COIN_GECKO_USDC_ID][currency.toLowerCase()] as number;
            return givenAmount / usdcPriceInGivenCurrency;
        } else {
            throw new Error('Failed to get the USDC price in the given currency');
        }
    } catch (error) {
        throw error;
    }
};
