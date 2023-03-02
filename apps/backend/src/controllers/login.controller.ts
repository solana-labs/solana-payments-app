import { Request, Response } from 'express'
import { verifyRequest } from '../utils/verify-request.util'
import { Merchant } from '@prisma/client'
import { getMerchant, createMerchant } from '../services/database/merchant'

export const loginController = async (request: Request, response: Response) => {
    let pubkey: string
    var merchant: Merchant | null

    try {
        pubkey = await verifyRequest(request)
    } catch {
        response.sendStatus(401)
        return
    }

    merchant = await getMerchant(pubkey)

    if (merchant == null) {
        merchant = await createMerchant(pubkey)
    }

    response.send({
        merchant: merchant,
    })
}
