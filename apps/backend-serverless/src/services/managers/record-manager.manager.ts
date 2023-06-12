import { Merchant, PaymentRecord, PrismaClient } from '@prisma/client';
import { MerchantService } from '../database/merchant-service.database.service.js';

// export interface RecordManager<RecordType> {
//     // getMerchantForRecord: (recordId: string) => Promise<Merchant | null>;
//     getRecord: (recordId: string) => Promise<RecordType | null>;
// }

// export class PaymentRecordManager implements RecordManager<PaymentRecord> {
//     private merchantService: MerchantService;

//     constructor(prisma: PrismaClient) {
//         this.merchantService = new MerchantService(prisma);
//     }

//     getMerchantForRecord(recordId: string): Promise<Merchant | null> {

//     }
// }
