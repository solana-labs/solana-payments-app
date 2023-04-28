import { Request, Response } from "express";
import { createShopifyOAuthGrantRedirectUrl } from "../configs/endpoints.config";
import {
  AppInstallQueryParam,
  appInstallQueryParmSchema,
} from "../models/install-query-parms.model";
import { verifyShopifyInstallRequest } from "../services/verify-requests/verify-shopify-install-request";
import * as anchor from "@project-serum/anchor";
import {
  setShopifyLastNonceForShop,
  shopifyAccessExists,
} from "../services/database/shopify";

// This controller is the starting point for a merchant installing the payment app
// on their store.
// https://shopify.dev/apps/auth/oauth/getting-started
export const instalController = async (
  request: Request,
  response: Response
) => {
  // Verify the security of the request given to install the shopify app
  try {
    await verifyShopifyInstallRequest(request.query);
  } catch (error: unknown) {
    if (error instanceof Error) {
      // redirect to error state
    }
  }

  // Parse the request for the inputs
  try {
    var parsedAppInstallQuery: AppInstallQueryParam =
      appInstallQueryParmSchema.cast(request.query) as AppInstallQueryParam;
  } catch (error) {
    throw new Error("Did not find the required info to verify.");
  }

  const shop = parsedAppInstallQuery.shop;

  const shopExists = await shopifyAccessExists(shop);

  if (shopExists == false) {
    // await createShopifyAccess()
  }

  // Create a nonce and store it to securly verify this install request
  const nonce = anchor.web3.Keypair.generate().publicKey.toBase58();
  await setShopifyLastNonceForShop(shop, nonce);

  const oAuthRedirectUrl = createShopifyOAuthGrantRedirectUrl(shop, nonce);
  response.redirect(oAuthRedirectUrl);
};
