// import * as Sentry from '@sentry/serverless';
// import { APIGatewayProxyResultV2, APIGatewayProxyWebsocketEventV2 } from 'aws-lambda';
// import { PrismaClient } from '@prisma/client';
// import pkg from 'aws-sdk';
// import { sendWebsocketMessage } from '../../services/websocket/send-websocket-message.service.js';
// const { ApiGatewayManagementApi } = pkg;

// const prisma = new PrismaClient();

// Sentry.AWSLambda.init({
//     dsn: process.env.SENTRY_DSN,
//     tracesSampleRate: 1.0,
//     integrations: [new Sentry.Integrations.Prisma({ client: prisma })],
// });

// export const defaultHandler = Sentry.AWSLambda.wrapHandler(
//     async (event: APIGatewayProxyWebsocketEventV2): Promise<APIGatewayProxyResultV2> => {
//         await sendWebsocketMessage(
//             event.requestContext.connectionId,
//             JSON.stringify({
//                 messageType: 'paymentDetails',
//                 paymentDetails: {
//                     merchantDisplayName: 'Test Merchant',
//                     totalAmountUSDCDisplay: '10 USDC',
//                     totalAmountFiatDisplay: '$10.00',
//                     cancelUrl: 'https://example.com/cancel',
//                     completed: false,
//                     redirectUrl: null,
//                 },
//             })
//         );

//         return {
//             statusCode: 200,
//         };
//     },
//     {
//         rethrowAfterCapture: true,
//     }
// );
