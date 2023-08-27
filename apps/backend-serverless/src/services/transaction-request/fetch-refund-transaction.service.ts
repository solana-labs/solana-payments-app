import { PaymentRecord, RefundRecord } from '@prisma/client';
import { TOKEN_PROGRAM_ID, decodeTransferCheckedInstruction } from '@solana/spl-token';
import axios from 'axios';
import { USDC_MINT } from '../../configs/tokens.config.js';
import { InvalidInputError } from '../../errors/invalid-input.error.js';
import {
    TransactionRequestResponse,
    parseAndValidateTransactionRequestResponse,
} from '../../models/transaction-requests/transaction-request-response.model.js';
import { delay } from '../../utilities/delay.utility.js';
import { findPayingTokenAddressFromTransaction } from '../../utilities/transaction-inspection.utility.js';
import { buildRefundTransactionRequestEndpoint } from '../../utilities/transaction-request/endpoints.utility.js';
import { fetchTransaction } from '../fetch-transaction.service.js';
import { fetchBalance } from '../helius.service.js';

export const fetchRefundTransaction = async (
    refundRecord: RefundRecord,
    associatedPaymentRecord: PaymentRecord,
    account: string,
    gas: string,
    singleUseNewAcc: string,
    singleUsePayer: string,
    axiosInstance: typeof axios
): Promise<TransactionRequestResponse> => {
    // We can't refund a payment that doesn't exist
    if (associatedPaymentRecord.transactionSignature == null) {
        throw new Error('Payment transaction not found.');
    }

    // Now we have the transaction that the orginal payment was made in
    // This is also something we could add to a job with sqs to save calls here and then make
    // it easier to populate on merchant-ui read calls
    // TODO: Figure out if we need to direct it to the exact token account of the customer, probably yes

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

    const fetchBalancePromise = fetchBalance(account, mint.pubkey.toBase58());

    const payingCustomerTokenAddress = await findPayingTokenAddressFromTransaction(transaction);

    let receiverWalletAddress: string | null = null;
    let receiverTokenAddress: string | null = payingCustomerTokenAddress.toBase58();

    // if (refundRecord.test) {
    //     receiverWalletAddress = account;
    //     receiverTokenAddress = null;
    // }

    const endpoint = buildRefundTransactionRequestEndpoint(
        receiverWalletAddress,
        receiverTokenAddress,
        account,
        USDC_MINT.toBase58(),
        USDC_MINT.toBase58(),
        gas,
        refundRecord.usdcAmount.toFixed(6), // USDC is 6 decimals
        'size',
        'blockhash',
        'true',
        singleUseNewAcc,
        singleUsePayer,
        'test-one,test-two' // TODO: Update these with real values
    );
    const headers = {
        'Content-Type': 'application/json',
    };

    const axiosPostPromise = axiosInstance.post(endpoint, { headers: headers });

    const [balance, axiosResponse] = await Promise.all([fetchBalancePromise, axiosPostPromise]);

    // Check balance
    if (balance < refundRecord.usdcAmount) {
        throw new InvalidInputError('Not enough balance to refund');
    }

    // Check axios response
    if (axiosResponse.status != 200) {
        throw new Error('Error fetching refund transaction.');
    }

    const transactionRequestResponse = parseAndValidateTransactionRequestResponse(axiosResponse.data);

    return transactionRequestResponse;
};
