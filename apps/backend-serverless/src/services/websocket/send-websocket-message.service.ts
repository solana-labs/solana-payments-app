import { PrismaClient, WebsocketSession } from '@prisma/client';
import pkg from 'aws-sdk';
import { WebsocketSessionService } from '../database/websocket.database.service.js';
const { ApiGatewayManagementApi } = pkg;

export class WebSocketService {
    private websocketSessionService: WebsocketSessionService;

    constructor(private prisma: PrismaClient, private apiGatewayManagementApi: typeof ApiGatewayManagementApi) {
        this.websocketSessionService = new WebsocketSessionService(prisma);
    }

    private getWebsocketSessionsForPaymentRecordId = async (paymentRecordId: string): Promise<WebsocketSession[]> => {
        return await this.websocketSessionService.getWebsocketSessions({ paymentRecordId: paymentRecordId });
    };
}

export const sendWebsocketMessage = async (connectionId: string, payload: unknown): Promise<void> => {
    const apigwManagementApi = new ApiGatewayManagementApi({
        endpoint: 'http://localhost:4009',
    });

    const postParams = {
        Data: JSON.stringify(payload),
        ConnectionId: connectionId,
    };

    try {
        const connection = await apigwManagementApi.postToConnection(postParams).promise();
        console.log(connection);
    } catch (err) {
        if (err.statusCode === 410) {
            console.log(err);
            console.log('Found stale connection, deleting ' + connectionId);
        } else {
            console.error('Failed to post. Error: ' + JSON.stringify(err));
        }
    }
};
