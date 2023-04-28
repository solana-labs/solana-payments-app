import express, { Request, Response } from "express";

export const processRefundController = (
  request: Request,
  response: Response
) => {
  response.status(201).send("Refund");
};
