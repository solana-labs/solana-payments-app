import { WebsocketSession } from '@prisma/client';
import pkg from 'aws-sdk';
const { ApiGatewayManagementApi } = pkg;

export interface WebSocketSessionFetcher<WebsocketQuery> {
    fetchWebsocketSessions: (query: WebsocketQuery) => Promise<WebsocketSession[]>;
}
export class WebSocketService<WebsocketQuery> {
    private websocketSessions: WebsocketSession[] = [];
    private apiGatewayManagementApi: pkg.ApiGatewayManagementApi;
    private loaded = false;

    constructor(
        apiGatewayEndpoint: string,
        private query: WebsocketQuery,
        private websocketSessionService: WebSocketSessionFetcher<WebsocketQuery>
    ) {
        this.apiGatewayManagementApi = new ApiGatewayManagementApi({ endpoint: apiGatewayEndpoint });
    }

    private loadSessions = async (): Promise<void> => {
        this.websocketSessions = await this.websocketSessionService.fetchWebsocketSessions(this.query);
        this.loaded = true;
    };

    private sendMessage = async (message: WebsocketMessage, payload: unknown): Promise<void> => {
        // Log the message and payload being sent
        if (this.loaded === false) {
            await this.loadSessions();
        }

        for (const websocketSession of this.websocketSessions) {
            try {
                const postParams = {
                    Data: JSON.stringify({
                        messageType: message,
                        payload,
                    }),
                    ConnectionId: websocketSession.connectionId,
                };
                await this.apiGatewayManagementApi.postToConnection(postParams).promise();
            } catch (error) {
                console.log(error);
            }
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

    sendTransactionRequestFailedMessage = async () => {
        await this.sendMessage(WebsocketMessage.transactionRequestFailed, null);
    };

    sendProcessingTransactionMessage = async () => {
        await this.sendMessage(WebsocketMessage.processingTransaction, null);
    };

    sendShopifyRetryMessage = async () => {
        await this.sendMessage(WebsocketMessage.shopifyRetry, null);
    };

    sendFailedProcessingTransactionMessage = async () => {
        await this.sendMessage(WebsocketMessage.failedProcessingTransaction, null);
    };

    sendInsufficientFundsMessage = async () => {
        await this.sendMessage(WebsocketMessage.insufficientFunds, null);
    };
}

export enum WebsocketMessage {
    completedDetails = 'completedDetails',
    paymentDetails = 'paymentDetails',
    errorDetails = 'errorDetails',
    transactionRequestStarted = 'transactionRequestStarted',
    transactionDelivered = 'transactionDelivered',
    transactionRequestFailed = 'transactionRequestFailed',
    processingTransaction = 'processingTransaction',
    shopifyRetry = 'shopifyRetry',
    failedProcessingTransaction = 'failedProcessingTransaction',
    insufficientFunds = 'insufficientFunds',
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
