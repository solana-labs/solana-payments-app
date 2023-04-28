// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto-js";
import {
  AppInstallQueryParam,
  appInstallQueryParmSchema,
} from "@/models/install-query-params.model";
import queryString from "query-string";
import { PrismaClient, Merchant } from "@prisma/client";

type Data = {
  name: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const prisma = new PrismaClient();

  try {
    await verifyShopifyInstallRequest(req.query);
  } catch (e) {
    if (e instanceof Error) {
      res.status(500).json({ name: e.message });
      return;
    }
  }

  let parsedAppInstallQuery: AppInstallQueryParam;

  try {
    parsedAppInstallQuery = appInstallQueryParmSchema.cast(
      req.query
    ) as AppInstallQueryParam;
  } catch (e) {
    res.status(500).json({ name: "whoops" });
    return;
  }

  if (parsedAppInstallQuery == null) {
    return;
  }

  const shop = parsedAppInstallQuery.shop;

  try {
    const merchant = await prisma.merchant.findUnique({
      where: {
        shop: shop,
      },
    });

    const newNonce = "a";

    if (merchant == null) {
      await prisma.merchant.create({
        data: {
          shop: shop,
          lastNonce: newNonce,
        },
      });
    } else {
      await prisma.merchant.update({
        where: {
          shop: shop,
        },
        data: {
          lastNonce: newNonce,
        },
      });
    }
  } catch (e) {
    if (e instanceof Error) {
      res.status(500).json({ name: e.message });
    }
    return;
  }

  const redirectUrl = createShopifyOAuthGrantRedirectUrl(shop, shop);

  res.status(200).redirect(redirectUrl);
}

export const parseAppInstallQueryParms = (
  appInstallQuery: any
): AppInstallQueryParam => {
  let parsedAppInstallQuery: AppInstallQueryParam;
  try {
    parsedAppInstallQuery = appInstallQueryParmSchema.cast(
      appInstallQuery
    ) as AppInstallQueryParam;
  } catch (error) {
    throw new Error("Did not find the required info to verify.");
  }
  return parsedAppInstallQuery;
};

export const verifyShopifyInstallRequest = (appInstallQuery: any) => {
  // Verify that the object passed in can be parsed into an AppInstallQueryParam object
  let parsedAppInstallQuery: AppInstallQueryParam =
    parseAppInstallQueryParms(appInstallQuery);

  // Save the hmac, remove it from the object, get the query string after removing
  const hmac = parsedAppInstallQuery.hmac;

  if (hmac == undefined) {
    throw new Error("Did not find the required info to verify.");
  }

  delete parsedAppInstallQuery["hmac"];
  const queryStringAfterRemoving = queryString.stringify(parsedAppInstallQuery);

  const secret = process.env.SHOPIFY_SECRET_KEY;

  // Check for a secret key to decode with
  if (secret == undefined) {
    throw new Error("Did not have the required info to verify.");
  }

  const digest = crypto.HmacSHA256(queryStringAfterRemoving, secret);
  const digestString = digest.toString();

  if (digestString != hmac) {
    throw new Error(queryStringAfterRemoving);
  }
};

// redirect url specified here: https://shopify.dev/apps/auth/oauth/getting-started#redirect-to-the-grant-screen-using-a-3xx-redirect
export const createShopifyOAuthGrantRedirectUrl = (
  shop: string,
  nonce: string
) => {
  const clientId = process.env.SHOPIFY_CLIENT_ID;
  const BASE_URL = process.env.BASE_URL;
  const redirectUrl = BASE_URL + "/redirect";
  return `https://${shop}/admin/oauth/authorize?client_id=${clientId}&scope=${createScopeString(
    [ShopifyScope.WRITE_PAYMENT_GATEWAYS, ShopifyScope.WRITE_PAYMENT_SESSIONS]
  )}&redirect_uri=${redirectUrl}&state=${nonce}`;
};

// all scopes are listed here: https://shopify.dev/api/usage/access-scopes#authenticated-access-scopes
export const createScopeString = (scopes: ShopifyScope[]) => {
  return scopes.map((scope) => scope.toString()).join(",");
};

export enum ShopifyScope {
  WRITE_PAYMENT_GATEWAYS = "write_payment_gateways",
  WRITE_PAYMENT_SESSIONS = "write_payment_sessions",
}
