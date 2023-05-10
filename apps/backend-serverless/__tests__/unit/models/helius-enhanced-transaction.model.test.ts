import { parseAndValidateHeliusEnchancedTransaction } from '../../../src/models/helius-enhanced-transaction.model.js'

describe('unit testing helius enhanced transaction model', () => {
    it('valid ehancted transaction model', () => {
        const validEnhancedTransaction = [
            {
                accountData: [
                    {
                        account: '9hBUxihyvswYSExF8s7K5SZiS3XztF3DAT7eTZ5krx4T',
                        nativeBalanceChange: -10000,
                        tokenBalanceChanges: [],
                    },
                    {
                        account: '5rPoLqhSC2VnMULYfzYX4712GEFNFv8nof6K6nP7GX8E',
                        nativeBalanceChange: 0,
                        tokenBalanceChanges: [],
                    },
                    {
                        account: '7jHY5Ln7zRYSrQ4pNX3jb6FeWQnbnqX9XSpU5Y1tex4w',
                        nativeBalanceChange: 0,
                        tokenBalanceChanges: [
                            {
                                mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
                                rawTokenAmount: {
                                    decimals: 6,
                                    tokenAmount: '100000',
                                },
                                tokenAccount:
                                    '7jHY5Ln7zRYSrQ4pNX3jb6FeWQnbnqX9XSpU5Y1tex4w',
                                userAccount:
                                    'ExvbioyTPuFivNJjPcYiCbHijTWPAHzfRXHnAmA4cyRx',
                            },
                        ],
                    },
                    {
                        account: 'F4aXhCqf54YkcNiyQNyaS3WsjsopUHh3oJKRxAsnsG6R',
                        nativeBalanceChange: 0,
                        tokenBalanceChanges: [
                            {
                                mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
                                rawTokenAmount: {
                                    decimals: 6,
                                    tokenAmount: '-100000',
                                },
                                tokenAccount:
                                    'F4aXhCqf54YkcNiyQNyaS3WsjsopUHh3oJKRxAsnsG6R',
                                userAccount:
                                    '5rPoLqhSC2VnMULYfzYX4712GEFNFv8nof6K6nP7GX8E',
                            },
                        ],
                    },
                    {
                        account: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
                        nativeBalanceChange: 0,
                        tokenBalanceChanges: [],
                    },
                    {
                        account: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                        nativeBalanceChange: 0,
                        tokenBalanceChanges: [],
                    },
                ],
                description:
                    '5rPoLqhSC2VnMULYfzYX4712GEFNFv8nof6K6nP7GX8E transferred 0.1 USD Coin to ExvbioyTPuFivNJjPcYiCbHijTWPAHzfRXHnAmA4cyRx.',
                events: {},
                fee: 10000,
                feePayer: '9hBUxihyvswYSExF8s7K5SZiS3XztF3DAT7eTZ5krx4T',
                instructions: [
                    {
                        accounts: [
                            'F4aXhCqf54YkcNiyQNyaS3WsjsopUHh3oJKRxAsnsG6R',
                            'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
                            '7jHY5Ln7zRYSrQ4pNX3jb6FeWQnbnqX9XSpU5Y1tex4w',
                            '5rPoLqhSC2VnMULYfzYX4712GEFNFv8nof6K6nP7GX8E',
                        ],
                        data: 'i9TTqffgKmDLh',
                        innerInstructions: [],
                        programId:
                            'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                    },
                ],
                nativeTransfers: [],
                signature:
                    '2TWHQrdf7jk4h6TTx1aso56iZVY6LRS6wUt1Q4djPJhpaJ3uih7b7539rjHm3WLjwKDZg31ivgRGzbQ4AQMnJW8h',
                slot: 193181977,
                source: 'SOLANA_PROGRAM_LIBRARY',
                timestamp: 1683734845,
                tokenTransfers: [
                    {
                        fromTokenAccount:
                            'F4aXhCqf54YkcNiyQNyaS3WsjsopUHh3oJKRxAsnsG6R',
                        fromUserAccount:
                            '5rPoLqhSC2VnMULYfzYX4712GEFNFv8nof6K6nP7GX8E',
                        mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
                        toTokenAccount:
                            '7jHY5Ln7zRYSrQ4pNX3jb6FeWQnbnqX9XSpU5Y1tex4w',
                        toUserAccount:
                            'ExvbioyTPuFivNJjPcYiCbHijTWPAHzfRXHnAmA4cyRx',
                        tokenAmount: 0.1,
                        tokenStandard: 'Fungible',
                    },
                ],
                transactionError: null,
                type: 'TRANSFER',
            },
        ]

        expect(() => {
            parseAndValidateHeliusEnchancedTransaction(validEnhancedTransaction)
        }).not.toThrow()
    })
})
