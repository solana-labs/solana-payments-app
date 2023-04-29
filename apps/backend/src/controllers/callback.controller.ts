// import axios from 'axios'
import { Request, Response } from "express";
import { fetchIdToken } from "../services/id-token.service";
import * as jose from "jose";

interface CallbackQuery {
  code: string;
}

export const callbackController = async (
  request: Request<{}, {}, {}, CallbackQuery>,
  response: Response
) => {
  const authCode = request.query.code;
  const merchantPortalUrl = process.env.FRONT_END_URL;
  const idToken = await fetchIdToken(authCode);
  response.redirect(`${merchantPortalUrl}/authentication?token=${idToken}`);
};
