import { APIGatewayProxyEvent, APIGatewayProxyEventV2 } from 'aws-lambda';
import jwt from 'jsonwebtoken';

export interface AuthenticatedAPIGatewayProxyEvent
  extends APIGatewayProxyEvent {
  shopId: string;
}

export const withAuth = (event: APIGatewayProxyEventV2): string => {
  console.log('event', event);
  if (!event.cookies || event.cookies.length === 0) {
    return 'failed to find cookie';
  }

  const bearerCookie = event.cookies.find((cookie) =>
    cookie.startsWith('Bearer=')
  );

  if (!bearerCookie) {
    return 'failed to find cookie';
  }

  const bearerToken = bearerCookie.split('Bearer=')[1];

  try {
    const { id } = jwt.verify(bearerToken, process.env.JWT_SECRET_KEY);
    return id;
  } catch {
    return 'sf';
  }
};
