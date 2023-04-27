// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { ShopifyAccess } from '@prisma/client'

type Data = {
    name: ShopifyAccess[]
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    const prisma = new PrismaClient()

    const access = await prisma.shopifyAccess.findMany()

    res.status(200).json({ name: access })
}
