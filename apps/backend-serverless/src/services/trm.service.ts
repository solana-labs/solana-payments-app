import axios from 'axios';
import {
  TRM_API_KEY,
  TRM_CHAIN_SOLANA_ID,
  TRM_SCREEN_URL,
} from '../configs/trm.config.js';
import {
  TrmWalletScreenResponse,
  trmWalletScreenResponseSchema,
} from '../models/trm-wallet-screen-response.model.js';

export const screenAddress = async (address: string) => {
  if (!TRM_API_KEY) {
    throw new Error('TRM API key not found');
  }

  const headers = {
    'Content-Type': 'application/json',
    Authorization:
      'Basic ' +
      Buffer.from(`${TRM_API_KEY}:${TRM_API_KEY}`).toString('base64'),
  };

  const body = [
    {
      address: address,
      chain: TRM_CHAIN_SOLANA_ID,
    },
  ];

  const response = await axios({
    url: TRM_SCREEN_URL,
    method: 'POST',
    headers: headers,
    data: body,
  });

  return validateTrmResponse(response.data);
};

export const validateTrmResponse = (response: any): TrmWalletScreenResponse => {
  let parsedResponse: any;
  try {
    parsedResponse = trmWalletScreenResponseSchema.cast(response);
  } catch (error) {
    throw new Error('Did not find the required info to verify.');
  }
  return parsedResponse;
};
