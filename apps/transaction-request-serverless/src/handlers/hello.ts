<<<<<<< HEAD
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

export const hello = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  return {
    statusCode: 500,
    body: JSON.stringify(
      {
        event: event,
        hello: "hello world",
      },
      null,
      2
    ),
  };
};
=======
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

export const hello = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    return {
        statusCode: 500,
        body: JSON.stringify(
            {
                event: event,
                hello: 'world',
            },
            null,
            2
        ),
    }
}
>>>>>>> main
