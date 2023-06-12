import { GDPR, PrismaClient, WebsocketSession } from '@prisma/client';
import { prismaErrorHandler } from './shared.database.service.js';

export type WebsocketPaymentRecordIdQuery = {
    paymentRecordId: string;
};

export type WebsocketConnectionIdQuery = {
    connectionId: string;
};

export type WebsocketSessionQuery = WebsocketPaymentRecordIdQuery | WebsocketConnectionIdQuery;

export class WebsocketSessionService {
    private prisma: PrismaClient;

    constructor(prismaClient: PrismaClient) {
        this.prisma = prismaClient;
    }

    async createWebsocketSession(paymentId: string, connectionId: string): Promise<WebsocketSession> {
        return prismaErrorHandler(
            this.prisma.websocketSession.create({
                data: {
                    paymentRecordId: paymentId,
                    connectionId: connectionId,
                },
            })
        );
    }

    async getWebsocketSession(query: WebsocketSessionQuery): Promise<WebsocketSession | null> {
        return await this.prisma.websocketSession.findFirst({
            where: query,
        });
    }

    async getWebsocketSessions(query: WebsocketSessionQuery): Promise<WebsocketSession[]> {
        return await this.prisma.websocketSession.findMany({
            where: query,
        });
    }

    async deleteWebsocketSession(query: WebsocketConnectionIdQuery): Promise<WebsocketSession | null> {
        return await this.prisma.websocketSession.delete({
            where: query,
        });
    }
}
