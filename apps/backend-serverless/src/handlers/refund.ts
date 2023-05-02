import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

export const refund = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  return {
    statusCode: 200,
    body: JSON.stringify({}, null, 2),
  };
};
