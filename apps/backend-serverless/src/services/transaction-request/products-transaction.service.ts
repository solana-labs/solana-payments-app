import {
    PROGRAM_ID as BUBBLEGUM_PROGRAM_ID,
    MetadataArgs,
    TokenProgramVersion,
    TokenStandard,
    createCreateTreeInstruction,
    createMintToCollectionV1Instruction,
} from '@metaplex-foundation/mpl-bubblegum';
import {
    CreateMetadataAccountArgsV3,
    PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID,
    createCreateMasterEditionV3Instruction,
    createCreateMetadataAccountV3Instruction,
    createSetCollectionSizeInstruction,
} from '@metaplex-foundation/mpl-token-metadata';
import {
    ALL_DEPTH_SIZE_PAIRS,
    SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
    SPL_NOOP_PROGRAM_ID,
    ValidDepthSizePair,
    getConcurrentMerkleTreeAccountSize,
} from '@solana/spl-account-compression';
import {
    MINT_SIZE,
    TOKEN_PROGRAM_ID,
    createAssociatedTokenAccountInstruction,
    createInitializeMintInstruction,
    createMintToCheckedInstruction,
    getAssociatedTokenAddress,
    getMinimumBalanceForRentExemptMint,
} from '@solana/spl-token';
import { Connection, Keypair, PublicKey, SystemProgram, TransactionInstruction } from '@solana/web3.js';
import crypto from 'crypto';
import { MissingEnvError } from '../../errors/missing-env.error.js';

const heliusApiKey = process.env.HELIUS_API_KEY;

if (heliusApiKey == null) {
    throw new MissingEnvError('helius api');
}

const connection = new Connection(`https://rpc.helius.xyz/?api-key=${heliusApiKey}`);

async function getSeeds(merchantAddress: PublicKey) {
    const tree_seed = 'treeseed1';
    const mint_seed = 'mintseed1';

    const TREE_SEED = crypto
        .createHash('sha256')
        .update(tree_seed + merchantAddress.toString())
        .digest('hex')
        .substring(0, 32);
    const MINT_SEED = crypto
        .createHash('sha256')
        .update(mint_seed + merchantAddress.toString())
        .digest('hex')
        .substring(0, 32);

    return { TREE_SEED, MINT_SEED };
}

function findLeastDepthPair(n: number): ValidDepthSizePair {
    for (const pair of ALL_DEPTH_SIZE_PAIRS) {
        if (Math.pow(2, pair.maxDepth) >= n) {
            return pair;
        }
    }

    return ALL_DEPTH_SIZE_PAIRS[ALL_DEPTH_SIZE_PAIRS.length - 1];
}

export async function getCompressedAccounts(gasAddress: Keypair, merchantAddress: PublicKey) {
    const { TREE_SEED, MINT_SEED } = await getSeeds(merchantAddress);
    let treeKey = await PublicKey.createWithSeed(gasAddress.publicKey, TREE_SEED, SPL_ACCOUNT_COMPRESSION_PROGRAM_ID);

    let mint = await PublicKey.createWithSeed(gasAddress.publicKey, MINT_SEED, SPL_ACCOUNT_COMPRESSION_PROGRAM_ID);

    const [treeAuthority] = PublicKey.findProgramAddressSync([treeKey.toBuffer()], BUBBLEGUM_PROGRAM_ID);

    const [bubblegumSigner] = PublicKey.findProgramAddressSync(
        // `collection_cpi` is a custom prefix required by the Bubblegum program
        [Buffer.from('collection_cpi', 'utf8')],
        BUBBLEGUM_PROGRAM_ID
    );

    const [metadataAccount, _bump] = PublicKey.findProgramAddressSync(
        [Buffer.from('metadata', 'utf8'), TOKEN_METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer()],
        TOKEN_METADATA_PROGRAM_ID
    );
    const [masterEditionAccount, _bump2] = PublicKey.findProgramAddressSync(
        [
            Buffer.from('metadata', 'utf8'),
            TOKEN_METADATA_PROGRAM_ID.toBuffer(),
            mint.toBuffer(),
            Buffer.from('edition', 'utf8'),
        ],
        TOKEN_METADATA_PROGRAM_ID
    );

    console.log('\n\nPRINTING ALL KEYS\n\n');
    console.log('treeKey', treeKey.toString());
    console.log('mint', mint.toString());
    console.log('treeAuthority', treeAuthority.toString());
    console.log('bubblegumSigner', bubblegumSigner.toString());
    console.log('metadataAccount', metadataAccount.toString());
    console.log('masterEditionAccount', masterEditionAccount.toString());

    return { treeKey, mint, treeAuthority, bubblegumSigner, metadataAccount, masterEditionAccount };
}

export async function treeSetup(
    gasAddress: Keypair,
    merchantAddress: PublicKey,
    payer: PublicKey,
    maxNFTs: number
): Promise<TransactionInstruction[]> {
    const maxDepthSizePair = findLeastDepthPair(maxNFTs);
    console.log('maxDepthSizePair', maxDepthSizePair);
    const canopyDepth = maxDepthSizePair.maxDepth - 5;

    const requiredSpace = getConcurrentMerkleTreeAccountSize(
        maxDepthSizePair.maxDepth,
        maxDepthSizePair.maxBufferSize,
        canopyDepth
    );

    console.log('gass', gasAddress.publicKey.toString());
    console.log('merchant', merchantAddress.toString());
    let { treeKey, treeAuthority } = await getCompressedAccounts(gasAddress, merchantAddress);
    const { TREE_SEED, MINT_SEED } = await getSeeds(merchantAddress);

    const allocTreeIx = SystemProgram.createAccountWithSeed({
        fromPubkey: payer,
        newAccountPubkey: treeKey,
        basePubkey: gasAddress.publicKey,
        seed: TREE_SEED,
        lamports: await connection.getMinimumBalanceForRentExemption(requiredSpace),
        space: requiredSpace,
        programId: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
    });

    const createTreeIx = createCreateTreeInstruction(
        {
            payer: payer,
            treeCreator: gasAddress.publicKey,
            treeAuthority,
            merkleTree: treeKey,
            compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
            // NOTE: this is used for some on chain logging
            logWrapper: SPL_NOOP_PROGRAM_ID,
        },
        {
            maxBufferSize: maxDepthSizePair.maxBufferSize,
            maxDepth: maxDepthSizePair.maxDepth,
            public: false,
        },
        BUBBLEGUM_PROGRAM_ID
    );

    return [allocTreeIx, createTreeIx];
}

export async function setupCollection(
    gasAddress: Keypair,
    merchantAddress: PublicKey
): Promise<TransactionInstruction[]> {
    let { treeKey, mint, treeAuthority, metadataAccount, masterEditionAccount } = await getCompressedAccounts(
        gasAddress,
        merchantAddress
    );

    const { TREE_SEED, MINT_SEED } = await getSeeds(merchantAddress);
    let ata = await getAssociatedTokenAddress(
        mint, // mint
        merchantAddress // owner
    );

    // TODO CREAT URI for merchant collection

    let uri;
    const metadataV3: CreateMetadataAccountArgsV3 = {
        data: {
            name: 'Super Sweet NFT Collection',
            symbol: 'SSNC',
            // specific json metadata for the collection
            uri,
            sellerFeeBasisPoints: 100,
            creators: [
                {
                    address: gasAddress.publicKey,
                    verified: false,
                    share: 100,
                },
            ],
            collection: null,
            uses: null,
        },
        isMutable: false,
        collectionDetails: null,
    };

    const createAccountIx = SystemProgram.createAccountWithSeed({
        fromPubkey: merchantAddress,
        newAccountPubkey: mint,
        basePubkey: gasAddress.publicKey,
        seed: MINT_SEED,
        space: MINT_SIZE,
        lamports: await getMinimumBalanceForRentExemptMint(connection),
        programId: TOKEN_PROGRAM_ID,
    });

    const initMintIx = createInitializeMintInstruction(
        mint, // mint pubkey
        0, // decimals
        gasAddress.publicKey, // mint authority
        gasAddress.publicKey // freeze authority (you can use `null` to disable it. when you disable it, you can't turn it on again)
    );

    const createATAIx = createAssociatedTokenAccountInstruction(
        merchantAddress, // payer
        ata, // ata
        merchantAddress, // owner
        mint
    );

    const mintto = createMintToCheckedInstruction(
        mint,
        ata, // receiver (should be a token account)
        gasAddress.publicKey, // mint authority
        1, // amount. if your decimals is 8, you mint 10^8 for 1 token.
        0 // decimals
    );

    const createMetadataIx = createCreateMetadataAccountV3Instruction(
        {
            metadata: metadataAccount,
            mint: mint,
            mintAuthority: gasAddress.publicKey,
            payer: merchantAddress,
            updateAuthority: gasAddress.publicKey,
        },
        {
            createMetadataAccountArgsV3: metadataV3,
        }
    );

    const createMasterEditionIx = createCreateMasterEditionV3Instruction(
        {
            edition: masterEditionAccount,
            mint: mint,
            mintAuthority: gasAddress.publicKey,
            payer: merchantAddress,
            updateAuthority: gasAddress.publicKey,
            metadata: metadataAccount,
        },
        {
            createMasterEditionArgs: {
                maxSupply: 0,
            },
        }
    );

    // create the collection size instruction
    const collectionSizeIX = createSetCollectionSizeInstruction(
        {
            collectionMetadata: metadataAccount,
            collectionAuthority: gasAddress.publicKey,
            collectionMint: mint,
        },
        {
            setCollectionSizeArgs: { size: 50 },
        }
    );

    return [
        createAccountIx,
        initMintIx,
        createATAIx,
        mintto,
        createMetadataIx,
        createMasterEditionIx,
        collectionSizeIX,
    ];
}

export async function mintCompressedNFT(
    gasAddress: Keypair,
    merchantAddress: PublicKey,
    payer: PublicKey
): Promise<TransactionInstruction[]> {
    let { treeKey, mint, treeAuthority, bubblegumSigner, metadataAccount, masterEditionAccount } =
        await getCompressedAccounts(gasAddress, merchantAddress);

    const mintIxs: TransactionInstruction[] = [];

    // TODO get symbol and product ru

    const compressedNFTMetadata: MetadataArgs = {
        name: 'NFT Name',
        symbol: 'Product',
        // specific json metadata for each NFT
        uri: 'https://supersweetcollection.notarealurl/token.json',
        creators: [
            {
                address: gasAddress.publicKey,
                verified: false,
                share: 100,
            },
        ],
        editionNonce: 0,
        uses: null,
        collection: null,
        primarySaleHappened: false,
        sellerFeeBasisPoints: 0,
        isMutable: false,
        // these values are taken from the Bubblegum package
        tokenProgramVersion: TokenProgramVersion.Original,
        tokenStandard: TokenStandard.NonFungible,
    };

    const metadataArgs = Object.assign(compressedNFTMetadata, {
        collection: { key: mint, verified: false },
    });

    mintIxs.push(
        createMintToCollectionV1Instruction(
            {
                payer: payer,

                merkleTree: treeKey,
                treeAuthority,
                treeDelegate: payer,
                leafOwner: payer,
                leafDelegate: payer,
                // collection details
                collectionAuthority: payer,
                collectionAuthorityRecordPda: BUBBLEGUM_PROGRAM_ID,
                collectionMint: mint,
                collectionMetadata: metadataAccount,
                editionAccount: masterEditionAccount,

                // other accounts
                compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
                logWrapper: SPL_NOOP_PROGRAM_ID,
                bubblegumSigner: bubblegumSigner,
                tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
            },
            {
                metadataArgs,
            }
        )
    );

    return mintIxs;
}
