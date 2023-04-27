// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
    name: string
}

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    // Verify the security of the request given to install the shopify app
    try {
        // frig
    } catch (error: unknown) {
        if (error instanceof Error) {
            // redirect to error state
        }
    }

    res.status(200).json({ name: 'John Doe' })
}
