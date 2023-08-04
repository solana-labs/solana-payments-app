import * as token from '@solana/spl-token';
import * as web3 from '@solana/web3.js';
import { USDC_PUBKEY } from '../src/configs/pubkeys.config.js';
import { findAssociatedTokenAddress } from '../src/utilities/ata.utility.js';

describe('transaction test', () => {
    beforeEach((): void => {
        jest.setTimeout(6000);
    });

    const secretArray = [];

    const seed = Uint8Array.from(secretArray);

    const keypair = web3.Keypair.fromSecretKey(seed);
    const newKeypair = web3.Keypair.generate();
    let tokenAccount: web3.PublicKey | null = null;
    const customer = web3.Keypair.generate();
    let mintPubkey: web3.PublicKey | null = null;

    let newGuy: web3.Keypair | null = null;
    const connection = new web3.Connection(`https://rpc.helius.xyz/?api-key=${process.env.HELIUS_API_KEY}`);

    it.skip('create a mint.', async () => {
        const blockhash = await connection.getLatestBlockhash();
        const tx = new web3.Transaction({
            feePayer: keypair.publicKey,
            blockhash: blockhash.blockhash,
            lastValidBlockHeight: blockhash.lastValidBlockHeight,
        });

        mintPubkey = await token.createMint(
            connection, // conneciton
            keypair, // fee payer
            keypair.publicKey, // mint authority
            keypair.publicKey, // freeze authority (you can use `null` to disable it. when you disable it, you can't turn it on again)
            8, // decimals,
            newKeypair,
            {
                skipPreflight: true,
                commitment: 'confirmed',
            }
        );

        console.log(mintPubkey.toBase58());

        expect(true).toBe(true);
    });

    it.skip('create token account.', async () => {
        const random = await web3.PublicKey.findProgramAddressSync(
            [keypair.publicKey.toBuffer(), token.TOKEN_PROGRAM_ID.toBuffer(), mintPubkey!.toBuffer()],
            token.TOKEN_PROGRAM_ID
        );
        tokenAccount = random[0];

        newGuy = web3.Keypair.generate();

        const ata = await findAssociatedTokenAddress(newGuy.publicKey, USDC_PUBKEY!);

        const blockhash = await connection.getLatestBlockhash();
        const tx = new web3.Transaction({
            feePayer: keypair.publicKey,
            blockhash: blockhash.blockhash,
            lastValidBlockHeight: blockhash.lastValidBlockHeight,
        }).add(
            token.createAssociatedTokenAccountInstruction(
                keypair.publicKey,
                ata,
                newGuy.publicKey,
                USDC_PUBKEY,
                token.TOKEN_PROGRAM_ID,
                token.ASSOCIATED_TOKEN_PROGRAM_ID
            )
        );

        tx.partialSign(keypair);

        const txBuffer = tx.serialize({ requireAllSignatures: false, verifySignatures: false });

        const signature = await connection.sendRawTransaction(txBuffer, {
            skipPreflight: true,
            preflightCommitment: 'confirmed',
        });

        console.log(signature);

        expect(true).toBe(true);
    });

    it.skip('close token account.', async () => {
        const blockhash = await connection.getLatestBlockhash();
        const ata = await findAssociatedTokenAddress(newGuy!.publicKey, USDC_PUBKEY!);

        const tx = new web3.Transaction({
            feePayer: keypair.publicKey,
            blockhash: blockhash.blockhash,
            lastValidBlockHeight: blockhash.lastValidBlockHeight,
        }).add(
            // create mint account
            token.createCloseAccountInstruction(ata, keypair.publicKey, newGuy!.publicKey, [], token.TOKEN_PROGRAM_ID)
        );

        tx.partialSign(newGuy!);
        tx.partialSign(keypair);

        const txBuffer = tx.serialize({ requireAllSignatures: false, verifySignatures: false });

        const signature = await connection.sendRawTransaction(txBuffer, {
            skipPreflight: true,
            preflightCommitment: 'confirmed',
        });

        console.log(signature);

        expect(true).toBe(true);
    });
});
