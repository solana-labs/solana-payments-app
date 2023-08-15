import { GuestIdentityDriver, Metaplex } from '@metaplex-foundation/js';
import { TokenStandard } from '@metaplex-foundation/mpl-token-metadata';
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
    const points_seed = 'pointsseed2';

    const POINTS_SEED = crypto
        .createHash('sha256')
        .update(points_seed + merchantAddress.toString())
        .digest('hex')
        .substring(0, 32);

    return { POINTS_SEED };
}

export async function getPointsMint(gasAddress: PublicKey, merchantAddress: PublicKey): Promise<PublicKey> {
    const { POINTS_SEED } = await getPointsMintSeed(merchantAddress);
    let pointsMint = await PublicKey.createWithSeed(gasAddress, POINTS_SEED, TOKEN_PROGRAM_ID);
    return pointsMint;
}

export const fetchPointsSetupTransaction = async (
    mint: PublicKey,
    gasAddress: Keypair,
    payer: PublicKey,
    merchant: Merchant
): Promise<Transaction> => {
    let connection = getConnection();
    let metaplex = Metaplex.make(connection);
    let merchantIdentity = new GuestIdentityDriver(payer);

    const lamports = await getMinimumBalanceForRentExemptMint(connection);

    const programId = TOKEN_PROGRAM_ID;

    // const MY_TOKEN_METADATA: UploadMetadataInput = {
    //     name: merchant.name + ' POINTS',
    //     symbol: 'PTS',
    //     description: 'Points for ' + merchant.name,
    //     image: 'https://arweave.net/Ce1ZWw3hkGPHZDleRPKp8hQzndeXgmQzRoA6S8J9MXc', //add public URL to image you'd like to use
    // };

    // const { uri } = await metaplex.nfts().uploadMetadata(MY_TOKEN_METADATA);
    const uri = 'https://arweave.net/YjWWh-kE596IX3FYIk1YOYMk9CIKUHjsoOaVU8XyDkg';

    const { POINTS_SEED } = await getPointsMintSeed(new PublicKey(merchant.id));
    let nftBuilder = await metaplex
        .nfts()
        .builders()
        .createSft(
            {
                updateAuthority: gasAddress,
                mintAuthority: gasAddress,
                uri: uri,
                name: merchant.name + ' POINTS',
                sellerFeeBasisPoints: 1,
                symbol: 'PTS',
                useExistingMint: mint,
                tokenStandard: TokenStandard.Fungible,
            },
            { payer: merchantIdentity }
        );

    const latestBlockhash = await connection.getLatestBlockhash();
    const prep = await nftBuilder.prepend(
        {
            instruction: SystemProgram.createAccountWithSeed({
                fromPubkey: payer,
                newAccountPubkey: mint,
                basePubkey: gasAddress.publicKey,
                seed: POINTS_SEED,
                lamports,
                space: MINT_SIZE,
                programId,
            }),
            signerPubkeys: [gasAddress],
        },
        {
            instruction: createInitializeMint2Instruction(
                mint,
                6,
                gasAddress.publicKey,
                gasAddress.publicKey,
                programId
            ),
            signerPubkeys: [gasAddress],
        }
    );
    let transaction = await prep.toTransaction(latestBlockhash);
    return transaction;
};

export const fetchPointsUpdateTransaction = async (
    gasAddress: Keypair,
    payer: PublicKey,
    merchant: Merchant,
    back: number
): Promise<Transaction> => {
    let connection = getConnection();
    let metaplex = Metaplex.make(connection);

    let merchantIdentity = new GuestIdentityDriver(payer);

    let mint = await getPointsMint(gasAddress.publicKey, new PublicKey(merchant.id));
    const nft = await metaplex.nfts().findByMint({ mintAddress: mint });
    let updatedFields = {
        sellerFeeBasisPoints: back * 100,
    };

    let nftBuilder = await metaplex
        .nfts()
        .builders()
        .update(
            {
                nftOrSft: nft,
                updateAuthority: gasAddress,
                ...updatedFields,
            },
            {
                payer: merchantIdentity,
            }
        );

    const latestBlockhash = await connection.getLatestBlockhash();
    const transaction = await nftBuilder.toTransaction(latestBlockhash);

    return transaction;
};
