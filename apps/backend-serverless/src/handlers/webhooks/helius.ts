import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import {
    HeliusEnhancedTransactionArray,
    parseAndValidateHeliusEnchancedTransaction,
} from '../../models/dependencies/helius-enhanced-transaction.model.js';
import { PrismaClient, WebsocketSession } from '@prisma/client';
import { ErrorMessage, ErrorType, errorResponse } from '../../utilities/responses/error-response.utility.js';
import {
    PaymentRecordService,
    TransactionSignatureQuery,
} from '../../services/database/payment-record-service.database.service.js';
import { WebSocketService } from '../../services/websocket/send-websocket-message.service.js';
import { HeliusHeader, parseAndValidateHeliusHeader } from '../../models/dependencies/helius-header.model.js';
import { processTransaction } from '../../services/business-logic/process-transaction.service.js';
import axios from 'axios';

const prisma = new PrismaClient();

Sentry.AWSLambda.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    integrations: [new Sentry.Integrations.Prisma({ client: prisma })],
});

export const helius = Sentry.AWSLambda.wrapHandler(
    async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
        let heliusEnhancedTransactions: HeliusEnhancedTransactionArray;
        let heliusHeaders: HeliusHeader;
        const paymentRecordService = new PaymentRecordService(prisma);

        console.log('in helius');

        if (event.body == null) {
            return errorResponse(ErrorType.badRequest, ErrorMessage.missingBody);
        }

        console.log(event.body);

        const requiredAuthorizationHeader = process.env.HELIUS_AUTHORIZATION;

        if (requiredAuthorizationHeader == null) {
            return errorResponse(ErrorType.internalServerError, ErrorMessage.missingEnv);
        }

        try {
            heliusHeaders = parseAndValidateHeliusHeader({ authorization: event.headers['authorization'] });
        } catch (error) {
            Sentry.captureException(error);
            return errorResponse(ErrorType.badRequest, ErrorMessage.missingHeader);
        }

        if (heliusHeaders.authorization !== requiredAuthorizationHeader) {
            return errorResponse(ErrorType.unauthorized, ErrorMessage.missingHeader);
        }

        try {
            heliusEnhancedTransactions = parseAndValidateHeliusEnchancedTransaction(JSON.parse(event.body));
        } catch (error) {
            // TODO: Log this, actually might not be critical but we might want to put more logic around seeing if it's critical
            Sentry.captureException(error);
            return errorResponse(ErrorType.badRequest, ErrorMessage.invalidRequestBody);
        }

        console.log('parsed helius');

        const websocketUrl = process.env.WEBSOCKET_URL;

        if (websocketUrl == null) {
            throw new Error('Missing websocket url');
        }

        for (const heliusTransaction of heliusEnhancedTransactions) {
            const websocketService = new WebSocketService(
                websocketUrl,
                {
                    signature: heliusTransaction.signature,
                },
                paymentRecordService
            );

            await websocketService.sendProcessingTransactionMessage();

            try {
                await processTransaction(heliusTransaction, prisma, websocketService, axios);
            } catch (error) {
                // We will catch here on odd throws, valuable catches should happen elsewhere
                // TODO: Add logging around these odd throws with Sentry

                await websocketService.sendFailedProcessingTransactionMessage();

                Sentry.captureException(error);
                continue;
            }
        }

        return {
            statusCode: 200,
            body: JSON.stringify({}, null, 2),
        };
    },
    {
        rethrowAfterCapture: false,
    }
);
