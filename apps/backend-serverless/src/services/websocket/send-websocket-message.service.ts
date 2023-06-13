import { PrismaClient, WebsocketSession } from '@prisma/client';
import pkg from 'aws-sdk';
import { WebsocketSessionQuery, WebsocketSessionService } from '../database/websocket.database.service.js';
import { MissingEnvError } from '../../errors/missing-env.error.js';
const { ApiGatewayManagementApi } = pkg;

export interface WebSocketSessionFetcher<WebsocketQuery> {
    fetchWebsocketSessions: (query: WebsocketQuery) => Promise<WebsocketSession[]>;
}

export class WebSocketService<WebsocketQuery> {
    private websockerSessions: WebsocketSession[] = [];
    private loaded = false;
    private apiGatewayManagementApi: pkg.ApiGatewayManagementApi;

    constructor(
        apiGatewayEndpoint: string,
        private query: WebsocketQuery,
        private websocketSessionService: WebSocketSessionFetcher<WebsocketQuery>
    ) {
        this.apiGatewayManagementApi = new ApiGatewayManagementApi({ endpoint: apiGatewayEndpoint });
    }

    private loadSessions = async (): Promise<void> => {
        this.websockerSessions = await this.websocketSessionService.fetchWebsocketSessions(this.query);
        this.loaded = true;
    };

    private sendMessage = async (message: WebsocketMessage, payload: unknown): Promise<void> => {
        if (this.loaded === false) {
            await this.loadSessions();
        }

        for (const websocketSession of this.websockerSessions) {
            try {
                const postParams = {
                    Data: JSON.stringify({
                        messageType: message,
                        payload,
                    }),
                    ConnectionId: websocketSession.connectionId,
                };
                await this.apiGatewayManagementApi.postToConnection(postParams).promise();
            } catch (error) {}
        }
    };

    sendCompletedDetailsMessage = async (payload: CompletedDetailsPayload) => {
        await this.sendMessage(WebsocketMessage.completedDetails, { completedDetails: payload });
    };

    sendPaymentDetailsMessage = async (payload: PaymentDetailsPayload) => {
        await this.sendMessage(WebsocketMessage.paymentDetails, { paymentDetails: payload });
    };

    sendErrorDetailsMessage = async (payload: ErrorDetailsPayload) => {
        await this.sendMessage(WebsocketMessage.errorDetails, { errorDetails: payload });
    };

    sendTransacationRequestStartedMessage = async () => {
        await this.sendMessage(WebsocketMessage.transactionRequestStarted, null);
    };

    sendTransactionDeliveredMessage = async () => {
        await this.sendMessage(WebsocketMessage.transactionDelivered, null);
    };

    sendProcessingTransactionMessage = async () => {
        await this.sendMessage(WebsocketMessage.processingTransaction, null);
    };

    sendFailedProcessingTransactionMessage = async () => {
        await this.sendMessage(WebsocketMessage.failedProcessingTransaction, null);
    };
}

// export const sendWebsocketMessage = async (connectionId: string, payload: unknown): Promise<void> => {
//     const websocketUrl = process.env.WEBSOCKET_URL;

//     if (websocketUrl == null) {
//         throw new MissingEnvError('websocket url');
//     }

//     console.log('wtfff');
//     console.log('wtfff');
//     console.log('wtfff');
//     console.log('wtfff');
//     console.log('wtfff');
//     console.log('wtfff');
//     console.log('wtfff');
//     console.log('wtfff');

//     const apigwManagementApi = new ApiGatewayManagementApi({
//         endpoint: websocketUrl,
//     });

//     const postParams = {
//         Data: JSON.stringify(payload),
//         ConnectionId: connectionId,
//     };

//     try {
//         const connection = await apigwManagementApi.postToConnection(postParams).promise();
//         console.log(connection);
//     } catch (err) {
//         if (err.statusCode === 410) {
//             console.log(err);
//             console.log('Found stale connection, deleting ' + connectionId);
//         } else {
//             console.error('Failed to post. Error: ' + JSON.stringify(err));
//         }
//     }
// };

export enum WebsocketMessage {
    completedDetails = 'completedDetails',
    paymentDetails = 'paymentDetails',
    errorDetails = 'errorDetails',
    transactionRequestStarted = 'transactionRequestStarted',
    transactionDelivered = 'transactionDelivered',
    processingTransaction = 'processingTransaction',
    failedProcessingTransaction = 'failedProcessingTransaction',
}

export type CompletedDetailsPayload = {
    redirectUrl: string;
};

export type PaymentDetailsPayload = {
    merchantDisplayName: string;
    totalAmountUSDCDisplay: string;
    totalAmountFiatDisplay: string;
    cancelUrl: string;
    completed: boolean;
    redirectUrl: string | null;
};

export type ErrorDetailsPayload = {
    errorTitle: string;
    errorDetail: string;
    errorRedirect: string;
};

export type MessageTypePayload = {
    messageType: string;
};
