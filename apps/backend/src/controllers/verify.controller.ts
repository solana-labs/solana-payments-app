import { Request, Response } from "express";
import { verifyRequest } from "../utils/verify-request.util";

export const verifyController = async (
  request: Request,
  response: Response
) => {
  try {
    verifyRequest(request);
  } catch {
    response.send({ title: "fucked up" });
  }

  response.send({ title: "all good" });
};
