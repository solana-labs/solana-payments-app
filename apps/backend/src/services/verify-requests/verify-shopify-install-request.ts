import {
  AppInstallQueryParam,
  appInstallQueryParmSchema,
} from "../../models/install-query-parms.model";
import queryString from "query-string";
import crypto from "crypto-js";

export const verifyShopifyInstallRequest = async (appInstallQuery: any) => {
  // Verify that the object passed in can be parsed into an AppInstallQueryParam object
  let parsedAppInstallQuery: AppInstallQueryParam;
  try {
    parsedAppInstallQuery = appInstallQueryParmSchema.cast(
      appInstallQuery
    ) as AppInstallQueryParam;
  } catch (error) {
    throw new Error("Did not find the required info to verify.");
  }

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
    throw new Error("Did not have the correct info to verify.");
  }
};
