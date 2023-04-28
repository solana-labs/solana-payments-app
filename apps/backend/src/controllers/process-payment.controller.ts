import axios from "axios";
import express, { Request, Response } from "express";

export const processPaymentController = (
  request: Request,
  response: Response
) => {
  response.send({
    redirect_url: "https://buyer-payment-page.com/12345",
  });
};
