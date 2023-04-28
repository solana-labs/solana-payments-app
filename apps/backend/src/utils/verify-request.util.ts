import * as jose from "jose";
import { Request } from "express";

export const verifyRequest = async (request: Request) => {
  const idToken = request.headers.authorization?.split(" ")[1];

  console.log(idToken);

  if (idToken == undefined) {
    throw new Error("Auth token was not present in request.");
  }

  const app_pub_key = request.body.appPubKey;

  if (app_pub_key == undefined) {
    throw new Error("User ID was not present in request.");
  }

  const jwks = jose.createRemoteJWKSet(
    new URL("https://api.openlogin.com/jwks")
  );

  const jwtDecoded = await jose.jwtVerify(idToken, jwks, {
    algorithms: ["ES256"],
  });

  // do some verifying stuff here like checking if its still valid and grabbing our subject to return

  const payload = jwtDecoded.payload;

  console.log(payload);

  // if (subject == undefined) {
  //     throw new Error('Subject was not present in token.')
  // }

  // const expired = jwtDecoded.payload.exp

  // if (expired == undefined) {
  //     throw new Error('ID token was invalid.')
  // }

  // if (hasExpired(expired)) {
  //     throw new Error('ID token has expired.')
  // }

  const wallets = (jwtDecoded.payload as any).wallets;

  // if (wallets == undefined) {
  //     throw new Error('Could not find wallets in ID token.')
  // }

  // Checking `app_pub_key` against the decoded JWT wallet's public_key
  if (wallets[0].public_key === app_pub_key) {
    // Verified
    return app_pub_key;
  } else {
    throw new Error("Could not find wallets. its badddd.");
  }
};

const hasExpired = (expired: number) => {
  return Date.now() >= expired * 1000;
};
