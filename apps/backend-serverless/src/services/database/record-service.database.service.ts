// import { Merchant, PaymentRecord, PrismaClient, RefundRecord, TransactionRecord } from '@prisma/client';
// import { PaymentRecordService } from './payment-record-service.database.service.js';

import { PaymentRecord, PrismaClient, RefundRecord, TransactionRecord } from '@prisma/client';
import { PaymentRecordService } from './payment-record-service.database.service.js';
import { RefundRecordService } from './refund-record-service.database.service.js';

export interface RecordService<RecordType> {
    getRecord: (transactionRecord: TransactionRecord) => Promise<RecordType | null>;
    updateRecordToPaid: (recordId: string, transactionSignature: string) => Promise<RecordType>;
    updateRecordToCompleted: (recordId: string, redirectUrl: string) => Promise<RecordType>;
}

export const getRecordServiceForTransaction = async (
    transactionRecord: TransactionRecord,
    prisma: PrismaClient
): Promise<RecordService<PaymentRecord | RefundRecord>> => {
    switch (transactionRecord.type) {
        case 'payment':
            return new PaymentRecordService(prisma);
        case 'refund':
            return new RefundRecordService(prisma);
    }
};
