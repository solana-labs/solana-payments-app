import { PrismaClient, WebsocketSession } from '@prisma/client';
import pkg from 'aws-sdk';
import { WebsocketSessionService } from '../database/websocket.database.service.js';
import { MissingEnvError } from '../../errors/missing-env.error.js';
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
    const websocketUrl = process.env.WEBSOCKET_URL;

    if (websocketUrl == null) {
        throw new MissingEnvError('websocket url');
    }

    console.log('wtfff');
    console.log('wtfff');
    console.log('wtfff');
    console.log('wtfff');
    console.log('wtfff');
    console.log('wtfff');
    console.log('wtfff');
    console.log('wtfff');

    const apigwManagementApi = new ApiGatewayManagementApi({
        endpoint: websocketUrl,
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
