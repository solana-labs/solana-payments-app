import * as bs58 from "bs58";

export const decode = (str: string): string =>
  Buffer.from(str, "base64").toString("binary");
