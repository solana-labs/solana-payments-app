import { Request, Response } from "express";

export const heliusController = async (
  request: Request,
  response: Response
) => {
  console.log(request.body);

  for (const transaction of request.body) {
    console.log(transaction.signature);
  }

  // get all the transactions that we are sent
  // check each signature to see if we cared about it
  // check other stuff ???

  response.sendStatus(200);
};
