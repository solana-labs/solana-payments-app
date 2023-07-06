import { PrismaClient } from '@prisma/client';
import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { deleteMerchantAuthCookieHeader } from '../../utilities/clients/merchant-ui/delete-cookie-header.utility.js';

const prisma = new PrismaClient();

Sentry.AWSLambda.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    integrations: [new Sentry.Integrations.Prisma({ client: prisma })],
});

export const logout = Sentry.AWSLambda.wrapHandler(
    async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
        console.log('hitting logout');
        const merchantCookie = deleteMerchantAuthCookieHeader();
        const nonceCookie = `nonce=; HttpOnly; Secure; SameSite=Lax; Max-age=0;`;

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Credentials': true,
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'text/html',
            },
            cookies: [merchantCookie, nonceCookie],
            body: JSON.stringify({ message: 'Logged out' }),
        };
    }
);
