import { web3 } from '@project-serum/anchor'
import { Request, Response } from 'express'
import {
    PayRequest,
    createPayTransaction,
    createSamplePayRequest,
} from 'transaction-builder'

export const payController = async (request: Request, response: Response) => {
    let payRequest: PayRequest

    try {
        payRequest = createSamplePayRequest()
    } catch (error) {
        response.send(JSON.stringify({ error: (error as Error).message }))
        return
    }

    const transaction = await createPayTransaction(payRequest)

    const base = transaction
        .serialize({ requireAllSignatures: false, verifySignatures: false })
        .toString('base64')

    response.send({
        transaction: base,
        message: 'message',
    })
}

const grabKeypairFromS3 = (): web3.Keypair => {
    // grab keypair from s3
    // grab the bytes
    return web3.Keypair.generate()
}
