import { z } from "zod";

export const stringifiedNumberSchema = () =>
  z
    .string()
    .transform(parseFloat)
    .refine((value) => !isNaN(value) && isFinite(value), {
      message: "Input must be a valid number in string format",
    });

export const decode = (str: string): string =>
  Buffer.from(str, "base64").toString("binary");
