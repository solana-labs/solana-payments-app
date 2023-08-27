import { PaymentRecord, RefundRecord } from '@prisma/client';
import { TOKEN_PROGRAM_ID, decodeTransferCheckedInstruction } from '@solana/spl-token';
import { delay } from '../../utilities/delay.utility.js';
import { fetchTransaction } from '../fetch-transaction.service.js';
import { fetchBalance } from '../helius.service.js';

export async function checkRefundBalance(
    associatedPaymentRecord: PaymentRecord,
    refundRecord: RefundRecord,
    account: string,
    amount: number
) {
    if (associatedPaymentRecord.transactionSignature == null) {
        throw new Error('Payment transaction not found.');
    }

    let transaction;

    while (transaction == null) {
        await delay(1000);

        transaction = await fetchTransaction(associatedPaymentRecord.transactionSignature);
    }

    const transferInstruction = transaction.instructions[transaction.instructions.length - 2];

    if (transferInstruction.programId.toBase58() != TOKEN_PROGRAM_ID.toBase58()) {
        const error = new Error('Invalid transaction.' + transferInstruction.programId.toBase58());
        throw error;
    }

    const decodedInstruction = decodeTransferCheckedInstruction(transferInstruction);

    const mint = decodedInstruction.keys.mint;

    const balance = await fetchBalance(account, mint.pubkey.toBase58());

    return balance >= refundRecord.usdcAmount;
}
