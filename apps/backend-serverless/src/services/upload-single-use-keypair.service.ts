import { PaymentRecord } from '@prisma/client';
import { web3 } from '@project-serum/anchor';

// This service method should upload the keypair to an encrypted s3 bucket for rent collection
// at a later time.

export const uploadSingleUseKeypair = async (singleUseKeypair: web3.Keypair, paymentRecord: PaymentRecord) => {
    singleUseKeypair;
    paymentRecord;
};
