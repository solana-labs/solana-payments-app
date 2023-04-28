import { Merchant } from "@prisma/client";
import { prisma } from "../../..";

export const getMerchant = async (pubkey: string): Promise<Merchant | null> => {
  const merchant = await prisma.merchant.findFirst({
    where: {
      userPublicKey: pubkey,
    },
  });
  return merchant;
};

export const createMerchant = async (
  pubkey: string
): Promise<Merchant | null> => {
  const merchant = await prisma.merchant.create({
    data: {
      name: "",
      userPublicKey: pubkey,
      paymentPublicKey: "",
    },
  });
  return merchant;
};
