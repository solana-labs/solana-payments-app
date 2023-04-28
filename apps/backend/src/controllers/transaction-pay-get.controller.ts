import { web3 } from "@project-serum/anchor";
import axios from "axios";
import { Request, Response } from "express";
import { transactionRequestServerEndpoint } from "../configs/endpoints.config";
import { fetchKeypair } from "../services/keypairs/fetch-keypair.service";
import { validatePayTransaction } from "../services/validate-transactions/validate-transaction.service";

export const transactionPayGetController = async (
  request: Request,
  response: Response
) => {
  console.log("HELLO");

  response.send({
    label: "Solana Payments App",
    icon: "https://i.imgur.com/zl3qoSN.jpeg",
  });
};
