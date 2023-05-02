import { APIGatewayProxyHandler } from 'aws-lambda';
import { screenAddress } from '../services/trm.server.js';

export const screenWallet: APIGatewayProxyHandler = async (event) => {
  const address = event.queryStringParameters?.address;

  if (!address) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Address parameter is missing' }),
    };
  }

  try {
    const response = await screenAddress(address);

    return {
      statusCode: 200,
      body: JSON.stringify(response.data),
    };
  } catch (error: any) {
    return {
      statusCode: error.response.status,
      body: JSON.stringify(error.response.data),
    };
  }
};
