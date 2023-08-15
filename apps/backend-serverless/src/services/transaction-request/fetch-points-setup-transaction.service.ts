import {
    CreateMetadataAccountArgsV3,
    PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID,
    createCreateMetadataAccountV3Instruction,
} from '@metaplex-foundation/mpl-token-metadata';
import { Merchant } from '@prisma/client';
import {
    MINT_SIZE,
    TOKEN_PROGRAM_ID,
    createInitializeMint2Instruction,
    getMinimumBalanceForRentExemptMint,
} from '@solana/spl-token';
import { Keypair, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import crypto from 'crypto';
import { getConnection } from '../../utilities/connection.utility.js';

export async function getPointsMintSeed(merchantAddress: PublicKey) {
    const points_seed = 'pointsseed1';

    const POINTS_SEED = crypto
        .createHash('sha256')
        .update(points_seed + merchantAddress.toString())
        .digest('hex')
        .substring(0, 32);

    return { POINTS_SEED };
}

export async function getPointsMint(gasAddress: Keypair, merchantAddress: PublicKey): Promise<PublicKey> {
    const { POINTS_SEED } = await getPointsMintSeed(merchantAddress);
    let pointsMint = await PublicKey.createWithSeed(gasAddress.publicKey, POINTS_SEED, TOKEN_PROGRAM_ID);
    return pointsMint;
}

export const fetchPointsSetupTransaction = async (
    mint: PublicKey,
    gasAddress: PublicKey,
    payer: PublicKey,
    merchant: Merchant
): Promise<Transaction> => {
    let connection = getConnection();
    // const metaplex = Metaplex.make(connection).use(keypairIdentity(gasAddress)).use(bundlrStorage());

    const lamports = await getMinimumBalanceForRentExemptMint(connection);

    const blockhash = await connection.getLatestBlockhash();
    const programId = TOKEN_PROGRAM_ID;

    const [metadataAccount, _bump] = PublicKey.findProgramAddressSync(
        [Buffer.from('metadata', 'utf8'), TOKEN_METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer()],
        TOKEN_METADATA_PROGRAM_ID
    );

    // const MY_TOKEN_METADATA: UploadMetadataInput = {
    //     name: merchant.name + ' POINTS',
    //     symbol: 'PTS',
    //     description: 'Points for ' + merchant.name,
    //     image: 'https://arweave.net/Ce1ZWw3hkGPHZDleRPKp8hQzndeXgmQzRoA6S8J9MXc', //add public URL to image you'd like to use
    // };

    // const { uri } = await metaplex.nfts().uploadMetadata(MY_TOKEN_METADATA);
    const uri = 'https://arweave.net/YjWWh-kE596IX3FYIk1YOYMk9CIKUHjsoOaVU8XyDkg';

    const metadataV3: CreateMetadataAccountArgsV3 = {
        data: {
            name: merchant.name + ' POINTS',
            symbol: 'PTS',
            uri,
            sellerFeeBasisPoints: 100,
            creators: null,
            collection: null,
            uses: null,
        },
        isMutable: true,
        collectionDetails: null,
    };

    const { POINTS_SEED } = await getPointsMintSeed(new PublicKey(merchant.id));
    return new Transaction({
        feePayer: payer,
        blockhash: blockhash.blockhash,
        lastValidBlockHeight: blockhash.lastValidBlockHeight,
    })
        .add(
            SystemProgram.createAccountWithSeed({
                fromPubkey: payer,
                newAccountPubkey: mint,
                basePubkey: gasAddress,
                seed: POINTS_SEED,
                lamports,
                space: MINT_SIZE,
                programId,
            }),
            createInitializeMint2Instruction(mint, 6, gasAddress, gasAddress, programId)
        )
        .add(
            createCreateMetadataAccountV3Instruction(
                {
                    metadata: metadataAccount,
                    mint: mint,
                    mintAuthority: gasAddress,
                    payer: payer,
                    updateAuthority: gasAddress,
                },
                {
                    createMetadataAccountArgsV3: metadataV3,
                }
            )
        );
};
