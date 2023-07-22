import {
    MINT_SIZE,
    TOKEN_PROGRAM_ID,
    createInitializeMint2Instruction,
    getMinimumBalanceForRentExemptMint,
} from '@solana/spl-token';
import { Connection, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { PointsSetupTransactionRequest } from '../../models/points-setup-transaction-request.model.js';

export class PointsSetupTransactionBuilder {
    private mintAddress: PublicKey;
    private merchantAddress: PublicKey;
    private gasAddress: PublicKey;

    constructor(pointsSetupTransactionRequest: PointsSetupTransactionRequest) {
        this.mintAddress = new PublicKey(pointsSetupTransactionRequest.mintAddress);
        this.merchantAddress = new PublicKey(pointsSetupTransactionRequest.merchantAddress);
        this.gasAddress = new PublicKey(pointsSetupTransactionRequest.gasAddress);
    }

    public async buildPointsSetupTransaction(connection: Connection): Promise<Transaction> {
        const lamports = await getMinimumBalanceForRentExemptMint(connection);

        const blockhash = await connection.getLatestBlockhash();
        const programId = TOKEN_PROGRAM_ID;

        return new Transaction({
            feePayer: this.merchantAddress,
            blockhash: blockhash.blockhash,
            lastValidBlockHeight: blockhash.lastValidBlockHeight,
        }).add(
            SystemProgram.createAccount({
                fromPubkey: this.merchantAddress,
                newAccountPubkey: this.mintAddress,
                space: MINT_SIZE,
                lamports,
                programId,
            }),
            createInitializeMint2Instruction(this.mintAddress, 6, this.gasAddress, this.gasAddress, programId)
        );
    }
}
