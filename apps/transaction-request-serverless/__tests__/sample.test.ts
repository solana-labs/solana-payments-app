import * as web3 from '@solana/web3.js';
import * as token from '@solana/spl-token';
import { USDC_PUBKEY } from '../src/configs/pubkeys.config.js';
import { getMinimumBalanceForRentExemptMint, MINT_SIZE } from '@solana/spl-token';

describe('Sample test', () => {
    beforeEach((): void => {
        jest.setTimeout(60000);
    });

    // const seed = Uint8Array.from(secretArray);

    // const keypair = web3.Keypair.fromSecretKey(seed);
    // const newKeypair = web3.Keypair.generate();
    // let tokenAccount: web3.PublicKey | null = null;
    // const customer = web3.Keypair.generate();
    // let mintPubkey: web3.PublicKey | null = null;

    it('create a mint.', async () => {
        //     const connection = new web3.Connection('https://rpc.helius.xyz/?api-key=5f70b753-57cb-422b-a018-d7df67b4470e');
        //     const blockhash = await connection.getLatestBlockhash();
        //     let tx = new web3.Transaction({
        //         feePayer: keypair.publicKey,
        //         blockhash: blockhash.blockhash,
        //         lastValidBlockHeight: blockhash.lastValidBlockHeight,
        //     });

        //     mintPubkey = await token.createMint(
        //         connection, // conneciton
        //         keypair, // fee payer
        //         keypair.publicKey, // mint authority
        //         keypair.publicKey, // freeze authority (you can use `null` to disable it. when you disable it, you can't turn it on again)
        //         8, // decimals,
        //         newKeypair,
        //         {
        //             skipPreflight: true,
        //             commitment: 'confirmed',
        //         }
        //     );

        //     console.log(mintPubkey.toBase58());

        expect(true).toBe(true);
    });

    // it('do it youself.', async () => {
    //     const connection = new web3.Connection('https://rpc.helius.xyz/?api-key=5f70b753-57cb-422b-a018-d7df67b4470e');
    //     const blockhash = await connection.getLatestBlockhash();
    //     let tx = new web3.Transaction({
    //         feePayer: keypair.publicKey,
    //         blockhash: blockhash.blockhash,
    //         lastValidBlockHeight: blockhash.lastValidBlockHeight,
    //     }).add(
    //         // create mint account
    //         web3.SystemProgram.createAccount({
    //             fromPubkey: keypair.publicKey,
    //             newAccountPubkey: newKeypair.publicKey,
    //             space: MINT_SIZE,
    //             lamports: await getMinimumBalanceForRentExemptMint(connection),
    //             programId: token.TOKEN_PROGRAM_ID,
    //         }),
    //         // init mint account
    //         token.createInitializeMintInstruction(
    //             mintPubkey!, // mint pubkey
    //             8, // decimals
    //             keypair.publicKey, // mint authority
    //             keypair.publicKey // freeze authority (you can use `null` to disable it. when you disable it, you can't turn it on again)
    //         )
    //     );

    //     tx.partialSign(keypair);
    //     tx.partialSign(newKeypair);

    //     const txBuffer = tx.serialize({ requireAllSignatures: false, verifySignatures: false });

    //     const signature = await connection.sendRawTransaction(txBuffer, {
    //         skipPreflight: true,
    //         preflightCommitment: 'confirmed',
    //     });

    //     console.log(signature);

    //     expect(true).toBe(true);
    // });

    // it('create token account.', async () => {
    //     const random = await web3.PublicKey.findProgramAddressSync(
    //         [keypair.publicKey.toBuffer(), token.TOKEN_PROGRAM_ID.toBuffer(), mintPubkey!.toBuffer()],
    //         token.TOKEN_PROGRAM_ID
    //     );
    //     tokenAccount = random[0];
    //     const connection = new web3.Connection('https://rpc.helius.xyz/?api-key=5f70b753-57cb-422b-a018-d7df67b4470e');
    //     const blockhash = await connection.getLatestBlockhash();
    //     let tx = new web3.Transaction({
    //         feePayer: keypair.publicKey,
    //         blockhash: blockhash.blockhash,
    //         lastValidBlockHeight: blockhash.lastValidBlockHeight,
    //     }).add(
    //         // create mint account
    //         token.createInitializeAccountInstruction(
    //             tokenAccount,
    //             USDC_PUBKEY,
    //             keypair.publicKey,
    //             token.TOKEN_PROGRAM_ID
    //         )
    //     );

    //     tx.partialSign(keypair);

    //     const txBuffer = tx.serialize({ requireAllSignatures: false, verifySignatures: false });

    //     const signature = await connection.sendRawTransaction(txBuffer, {
    //         skipPreflight: true,
    //         preflightCommitment: 'confirmed',
    //     });

    //     console.log(signature);

    //     expect(true).toBe(true);
    // });

    // it('close token account.', async () => {
    //     const connection = new web3.Connection('https://rpc.helius.xyz/?api-key=5f70b753-57cb-422b-a018-d7df67b4470e');
    //     const blockhash = await connection.getLatestBlockhash();
    //     let tx = new web3.Transaction({
    //         feePayer: keypair.publicKey,
    //         blockhash: blockhash.blockhash,
    //         lastValidBlockHeight: blockhash.lastValidBlockHeight,
    //     }).add(
    //         // create mint account
    //         token.createCloseAccountInstruction(
    //             tokenAccount!,
    //             keypair.publicKey,
    //             keypair.publicKey,
    //             [],
    //             token.TOKEN_PROGRAM_ID
    //         )
    //     );

    //     tx.partialSign(keypair);

    //     const txBuffer = tx.serialize({ requireAllSignatures: false, verifySignatures: false });

    //     const signature = await connection.sendRawTransaction(txBuffer, {
    //         skipPreflight: true,
    //         preflightCommitment: 'confirmed',
    //     });

    //     console.log(signature);

    //     expect(true).toBe(true);
    // });

    // it('create a mint.', async () => {
    //     const connection = new web3.Connection('https://rpc.helius.xyz/?api-key=5f70b753-57cb-422b-a018-d7df67b4470e');
    //     const blockhash = await connection.getLatestBlockhash();
    //     let tx = new web3.Transaction({
    //         feePayer: keypair.publicKey,
    //         blockhash: blockhash.blockhash,
    //         lastValidBlockHeight: blockhash.lastValidBlockHeight,
    //     });

    //     const newKeypair = web3.Keypair.generate();

    //     const pda = await web3.PublicKey.findProgramAddressSync(
    //         [Buffer.from('some-shopify-id', 'utf-8')],
    //         token.TOKEN_PROGRAM_ID
    //     );

    //     const createAccountIx = await token.createInitializeAccountInstruction(
    //         pda[0],
    //         USDC_PUBKEY,
    //         keypair.publicKey,
    //         token.TOKEN_PROGRAM_ID
    //     );

    //     tx = tx.add(createAccountIx);

    //     tx.partialSign(keypair);

    //     const txBuffer = tx.serialize({ requireAllSignatures: false, verifySignatures: false });

    //     const signature = await connection.sendRawTransaction(txBuffer);

    //     console.log(signature);

    //     expect(true).toBe(true);
    // });
});
