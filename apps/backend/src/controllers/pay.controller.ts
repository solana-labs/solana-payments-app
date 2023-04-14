import { web3 } from '@project-serum/anchor'
import axios from 'axios'
import { Request, Response } from 'express'
import { transactionRequestServerEndpoint } from '../configs/endpoints.config'
import { fetchKeypair } from '../services/keypairs/fetch-keypair.service'
import { validatePayTransaction } from '../services/validate-transactions/validate-transaction.service'

export const transactionPayGetController = async (
    request: Request,
    response: Response
) => {
    // What needs to be done here? These are the lists of tasks

    // 1. Parse the inputs
    // 2. Verify there is a payment
    // 3. Fetch the transaction
    // 4. Validate the transaction matches what we would expect
    // 4. Fetch saftey from TRM
    // 5. Sign the transaction
    // 6. Return the transaction

    // Which one of these needs to work for an end to end test?

    // Parse the inputs
    // Fetch transaction
    // Sign the transaction
    // Return the transaction

    // grab the account from the body
    const account = request.body.account

    // we will grab the gas keypair early so we can mark them as the fee payer
    const gasKeypair = await fetchKeypair('gas')

    // validate it

    const transactionRequestServerUrl = transactionRequestServerEndpoint(
        gasKeypair.publicKey.toBase58(),
        'G9t5AioDXzTWGUj9PhdQD2K5wHyPJTBMNmppsQE3Tpwn',
        'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        10,
        'size',
        'blockhash'
    )

    console.log(transactionRequestServerUrl)

    const transactionResponse = await axios.get(transactionRequestServerUrl)
    // How do i validate the response format?

    console.log(transactionResponse.data)

    const transactionDataString = transactionResponse.data.transaction
    const transactionBuffer = Buffer.from(transactionDataString, 'base64')
    const transaction = web3.Transaction.from(transactionBuffer)
    // Now I have a transaction that I can validate and sign

    // VALIDATE THE TRANSACTION
    try {
        validatePayTransaction(transaction)
    } catch (error) {
        // return error message for invalidate tx fetched
        response.sendStatus(400)
        return
    }

    // SIGN THE TRANSACTION
    // transaction.sign(gasKeypair)

    const signedSerializedTransaction = transaction
        .serialize({ requireAllSignatures: false, verifySignatures: false })
        .toString('base64')

    response.send({
        transaction: signedSerializedTransaction,
        message: 'standard message',
    })
}
