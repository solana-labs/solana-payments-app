import { buildPriceEndpoint, getPrices } from '../src';

describe('basic', () => {
    it('should work', async () => {
        const infos = await getPrices(['SOL', 'USDC']);
        console.log(infos);
        expect(true).toBeTruthy();
    });
});

// describe('testing url building', () => {
//     /*
//         What test cases do I want to handle?

//         GOOD INPUTS

//         https://price.jup.ag/v4/price?ids=SOL&vsToken=USDC
//         https://price.jup.ag/v4/price?ids=SOL,USDC,USDT&vsToken=USDC
//         https://price.jup.ag/v4/price?ids=SOL,USDC,USDT&vsToken=USDC
//         https://price.jup.ag/v4/price?ids=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&vsToken=USDC
//         https://price.jup.ag/v4/price?ids=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v,So11111111111111111111111111111111111111112&vsToken=USDC
//         https://price.jup.ag/v4/price?ids=So11111111111111111111111111111111111111112&vsToken=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
//         https://price.jup.ag/v4/price?ids=SOL&vsToken=USDC&vsAmount=500000

//         BAD INPUTS

//         symbols that aren't valid
//         long strings that aren't pubkeys
//         decimals for amounts
//         negative numbers
//         zero
//         emppty string

//     */

//     it('single id included as a symbol', async () => {
//         const EXPECTED_OUTPUT =
//             'https://price.jup.ag/v4/price?ids=SOL&vsToken=USDC'

//         const tokens = ['SOL']
//         const vsToken = 'USDC'

//         const result = buildPriceEndpoint(tokens, vsToken, null)
//         expect(result).toEqual(EXPECTED_OUTPUT)
//     })

//     it('mutiple ids included as symbols', async () => {
//         const EXPECTED_OUTPUT =
//             'https://price.jup.ag/v4/price?ids=SOL,USDT,DUST&vsToken=USDC'

//         const tokens = ['SOL', 'USDT', 'DUST']
//         const vsToken = 'USDC'

//         const result = buildPriceEndpoint(tokens, vsToken, null)
//         expect(result).toEqual(EXPECTED_OUTPUT)
//     })

//     it('single id included as a mint address', async () => {
//         const EXPECTED_OUTPUT =
//             'https://price.jup.ag/v4/price?ids=DUSTawucrTsGU8hcqRdHDCbuYhCPADMLM2VcCb8VnFnQ&vsToken=USDC'

//         const tokens = ['DUSTawucrTsGU8hcqRdHDCbuYhCPADMLM2VcCb8VnFnQ']
//         const vsToken = 'USDC'

//         const result = buildPriceEndpoint(tokens, vsToken, null)
//         expect(result).toEqual(EXPECTED_OUTPUT)
//     })

//     it('single id included as a mint address', async () => {
//         const EXPECTED_OUTPUT =
//             'https://price.jup.ag/v4/price?ids=DUSTawucrTsGU8hcqRdHDCbuYhCPADMLM2VcCb8VnFnQ&vsToken=USDC'

//         const tokens = ['DUSTawucrTsGU8hcqRdHDCbuYhCPADMLM2VcCb8VnFnQ']
//         const vsToken = 'USDC'

//         const result = buildPriceEndpoint(tokens, vsToken, null)
//         expect(result).toEqual(EXPECTED_OUTPUT)
//     })

//     it('mutiple ids included as mint addresss', async () => {
//         const EXPECTED_OUTPUT =
//             'https://price.jup.ag/v4/price?ids=DUSTawucrTsGU8hcqRdHDCbuYhCPADMLM2VcCb8VnFnQ,Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB&vsToken=USDC'

//         const tokens = [
//             'DUSTawucrTsGU8hcqRdHDCbuYhCPADMLM2VcCb8VnFnQ',
//             'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
//         ]
//         const vsToken = 'USDC'

//         const result = buildPriceEndpoint(tokens, vsToken, null)
//         expect(result).toEqual(EXPECTED_OUTPUT)
//     })

//     it('mutiple ids included as mint addresss', async () => {
//         const EXPECTED_OUTPUT =
//             'https://price.jup.ag/v4/price?ids=DUSTawucrTsGU8hcqRdHDCbuYhCPADMLM2VcCb8VnFnQ,Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB&vsToken=USDC'

//         const tokens = [
//             'DUSTawucrTsGU8hcqRdHDCbuYhCPADMLM2VcCb8VnFnQ',
//             'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
//         ]
//         const vsToken = 'USDC'

//         const result = buildPriceEndpoint(tokens, vsToken, null)
//         expect(result).toEqual(EXPECTED_OUTPUT)
//     })

//     it('includ vsAmount', async () => {
//         const EXPECTED_OUTPUT =
//             'https://price.jup.ag/v4/price?ids=SOL&vsAmount=5000000&vsToken=USDC'

//         const tokens = ['SOL']
//         const vsToken = 'USDC'

//         const result = buildPriceEndpoint(tokens, vsToken, 5000000)
//         expect(result).toEqual(EXPECTED_OUTPUT)
//     })
// })
