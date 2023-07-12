import axios, { AxiosResponse } from 'axios';
import { DependencyError } from '../errors/dependency.error.js';
import { MissingEnvError } from '../errors/missing-env.error.js';

const COIN_GECKO_USDC_ID = 'usd-coin';
const COIN_GECKO_API_BASE_URL = 'https://api.coingecko.com';

// For our current curent purposes, we assume currency here is a three letter ISO 4217 currency code.
// This is the type of value we will get from Shopify and it's the type of value Coin Gecko expects
export const convertAmountAndCurrencyToUsdcSize = async (
    givenAmount: number,
    currency: string,
    axiosInstance: typeof axios
): Promise<number> => {
    const coinGeckoApiKey = process.env.COIN_GECKO_API_KEY;

    if (coinGeckoApiKey == null) {
        throw new MissingEnvError('Missing coin gecko api key');
    }

    try {
        const url =
            `${COIN_GECKO_API_BASE_URL}/api/v3/simple/price` + `?ids=${COIN_GECKO_USDC_ID}&vs_currencies=${currency}`;

        const response: AxiosResponse = await axios.get(url);

        console.log(response.data);

        if (response.status === 200) {
            const usdcPriceInGivenCurrency = response.data[COIN_GECKO_USDC_ID][currency.toLowerCase()] as number;
            return givenAmount / usdcPriceInGivenCurrency;
        } else {
            throw new DependencyError('Coin gecko response failed' + response.status + response.data);
        }
    } catch (error) {
        throw new DependencyError('Coin gecko general error' + error);
    }
};
