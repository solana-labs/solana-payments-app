import { PrismaClient, Merchant } from "@prisma/client";

import { MerchantService } from '../../services/database/merchant-service.database.service.js';
import { getKybState } from "./get-kyb-state.js";

const getMerchantFromId = async (merchantId: string) => {
  const prisma = new PrismaClient();
  const merchantService = new MerchantService(prisma);

  const merchant = await merchantService.getMerchant({ id: merchantId });

  if (merchant == null) {
      throw new Error(`Merchant not found: ${merchantId}`);
  }

  return merchant;
}

export async function syncKybState(merchant: Merchant): Promise<Merchant>;
export async function syncKybState(merchantId: string): Promise<Merchant>;
export async function syncKybState(merchantOrId: Merchant | string): Promise<Merchant> {
  const prisma = new PrismaClient();
  const merchantService = new MerchantService(prisma);

  const merchant = typeof merchantOrId === 'string' ? await getMerchantFromId(merchantOrId) : merchantOrId;

  if (!merchant.kybInquiry) {
    throw new Error(`Merchant has no KYB inquiry: ${merchant.id}`);
  }

  const kybState = await getKybState(merchant.kybInquiry).catch(e => {
    console.error(`Could not determine kyb status: ${e}`);
    return null;
  });

  return merchantService.updateMerchant(merchant, { kybState });
}
