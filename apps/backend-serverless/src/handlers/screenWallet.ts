import { APIGatewayProxyHandler } from 'aws-lambda';
import { screenAddress, validateTrmResponse } from '../services/trm.service.js';

export const screenWallet: APIGatewayProxyHandler = async (event) => {
  //   const address = event.queryStringParameters?.address;
  const address = 'Htp9MGP8Tig923ZFY7Qf2zzbMUmYneFRAhSp7vSg4wxV';
  //   const address = '0xdac17f958d2ee523a2206206994597c13d831ec7';

  if (!address) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Address parameter is missing' }),
    };
  }

  try {
    const response = await screenAddress(address);

    const riskLevelBelow5 = response.every((item: any) =>
      item.entities.every((entity: any) => entity.riskScoreLevel < 5)
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ riskLevelBelow5 }),
    };

    // console.log('response data', response.data);
    // return {
    //   statusCode: 200,
    //   body: JSON.stringify(screenedAddress),
    // };
  } catch (error: any) {
    return {
      statusCode: error.response.status,
      body: JSON.stringify(error.response.data),
    };
  }
};
