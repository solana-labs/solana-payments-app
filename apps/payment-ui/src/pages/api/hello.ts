// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { Merchant } from "@prisma/client";

type Data = {
  name: Merchant[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const prisma = new PrismaClient();

  const access = await prisma.merchant.findMany();

  res.status(200).json({ name: access });
}
