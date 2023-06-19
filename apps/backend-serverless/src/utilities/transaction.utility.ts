import * as web3 from '@solana/web3.js';
import { fetchHeliusBalance } from '../services/helius.service.js';
import { MissingEnvError } from '../errors/missing-env.error.js';
import { TOKEN_PROGRAM_ID, createCloseAccountInstruction } from '@solana/spl-token';
import { findAssociatedTokenAddress } from './pubkeys.utility.js';
import { USDC_MINT } from '../configs/tokens.config.js';

export const createSweepingTransaction = async (
    sendingKeypair: web3.PublicKey,
    receivingKeypair: web3.PublicKey
): Promise<web3.Transaction> => {
    const heliusApiKey = process.env.HELIUS_API_KEY;

    if (heliusApiKey == null) {
        throw new MissingEnvError('helius api');
    }

    const ata = await findAssociatedTokenAddress(sendingKeypair, USDC_MINT);

    const connection = new web3.Connection(`https://rpc.helius.xyz/?api-key=${heliusApiKey}`);
    const blockhash = await connection.getLatestBlockhash();
    const balance = await connection.getBalance(sendingKeypair);
    const transaction = new web3.Transaction({
        feePayer: receivingKeypair,
        blockhash: blockhash.blockhash,
        lastValidBlockHeight: blockhash.lastValidBlockHeight,
    }).add(createCloseAccountInstruction(ata, receivingKeypair, sendingKeypair, [], TOKEN_PROGRAM_ID));

    return transaction;
};

export const sendTransaction = async (transaction: web3.Transaction) => {
    const heliusApiKey = process.env.HELIUS_API_KEY;

    if (heliusApiKey == null) {
        throw new MissingEnvError('helius api key');
    }

    const connection = new web3.Connection(`https://rpc.helius.xyz/?api-key=${heliusApiKey}`);
    const transactionBuffer = transaction.serialize({ requireAllSignatures: false, verifySignatures: false });
    const transactionSignature = await connection.sendRawTransaction(transactionBuffer, {
        skipPreflight: true,
    });
    console.log(transactionSignature);
};
