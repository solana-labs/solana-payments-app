import { GDPR, PrismaClient } from '@prisma/client';
import { prismaErrorHandler } from './shared.database.service.js';

export class GDPRService {
    private prisma: PrismaClient;

    constructor(prismaClient: PrismaClient) {
        this.prisma = prismaClient;
    }

    async createGDPRRequest(merchantId: string): Promise<GDPR> {
        return prismaErrorHandler(
            this.prisma.gDPR.create({
                data: {
                    merchantId: merchantId,
                    completed: false,
                },
            })
        );
    }
}
