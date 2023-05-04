import { web3 } from '@project-serum/anchor'
import { USDC_PUBKEY, WSOL_PUBKEY } from '../configs/pubkeys.config.js'
import { TokenInformation } from '../configs/token-list.config.js'
import { PayRequest } from '../models/pay-request.model.js'
import { createTransferIx } from '../services/builders/transfer-ix.builder.js'
import { createSwapIx } from '../services/swaps/create-swap-ix.service.js'
import { createConnection } from '../utils/connection.util.js'

const createPayTransaction = async (
    payRequest: PayRequest
): Promise<web3.Transaction> => {
    let connection: web3.Connection
    let transaction: web3.Transaction
    let receivingQuantity: number
    var swapIxs: web3.TransactionInstruction[] = []
    var transferIxs: web3.TransactionInstruction[] = []

    try {
        connection = createConnection()
    } catch (error) {
        throw error as Error
    }

    const blockhash = await connection.getLatestBlockhash()

    switch (payRequest.transactionType) {
        case 'blockhash':
            transaction = new web3.Transaction({
                feePayer: payRequest.feePayer,
                blockhash: blockhash.blockhash,
                lastValidBlockHeight: blockhash.lastValidBlockHeight,
            })
        case 'nonce':
            transaction = new web3.Transaction({
                feePayer: payRequest.feePayer,
                blockhash: blockhash.blockhash,
                lastValidBlockHeight: blockhash.lastValidBlockHeight,
            })
    }

    const receivingTokenInformation =
        await TokenInformation.queryTokenInformationFromPubkey(
            payRequest.receivingToken,
            connection
        )

    switch (payRequest.amountType) {
        case 'quantity':
            receivingQuantity = payRequest.receivingAmount
        case 'size':
            receivingQuantity = receivingTokenInformation.convertSizeToQuantity(
                payRequest.receivingAmount
            )
    }

    if (
        payRequest.sendingToken.toBase58() !=
        payRequest.receivingToken.toBase58()
    ) {
        swapIxs = await createSwapIx({
            provider: 'jupiter',
            quantity: receivingQuantity,
            fromMint: payRequest.sendingToken,
            toMint: payRequest.receivingToken,
            swapingWallet: payRequest.feePayer,
        })
    }

    transferIxs = await createTransferIx(
        payRequest.sender,
        payRequest.receiver,
        receivingTokenInformation,
        receivingQuantity,
        payRequest.createAta,
        connection
    )

    transaction = transaction.add(...swapIxs, ...transferIxs)

    return transaction
}

const createSamplePayRequest = (): PayRequest => {
    const payRequest = PayRequest.parse({
        receiver: '5rPoLqhSC2VnMULYfzYX4712GEFNFv8nof6K6nP7GX8E',
        sender: 'ExvbioyTPuFivNJjPcYiCbHijTWPAHzfRXHnAmA4cyRx',
        sendingToken: USDC_PUBKEY.toBase58(),
        receivingToken: USDC_PUBKEY.toBase58(),
        feePayer: 'ExvbioyTPuFivNJjPcYiCbHijTWPAHzfRXHnAmA4cyRx',
        receivingAmount: '10',
        amountType: 'size',
        transactionType: 'blockhash',
        createAta: true,
    })

    return payRequest
}

export { createPayTransaction, PayRequest, createSamplePayRequest }
