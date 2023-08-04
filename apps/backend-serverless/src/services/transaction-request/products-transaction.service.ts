import { Metaplex, bundlrStorage, keypairIdentity, toMetaplexFile } from '@metaplex-foundation/js';
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
import axios from 'axios';
import crypto from 'crypto';
import Jimp from 'jimp';
import { MissingEnvError } from '../../errors/missing-env.error.js';

const heliusApiKey = process.env.HELIUS_API_KEY;

if (heliusApiKey == null) {
    throw new MissingEnvError('helius api');
}

const connection = new Connection(`https://rpc.helius.xyz/?api-key=${heliusApiKey}`);

export async function getCompressedNftSeeds(merchantAddress: PublicKey) {
    const tree_seed = 'treeseed3';
    const mint_seed = 'mintseed3';

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
    const { TREE_SEED, MINT_SEED } = await getCompressedNftSeeds(merchantAddress);
    let treeKey = await PublicKey.createWithSeed(gasAddress.publicKey, TREE_SEED, SPL_ACCOUNT_COMPRESSION_PROGRAM_ID);

    let mint = await PublicKey.createWithSeed(gasAddress.publicKey, MINT_SEED, TOKEN_PROGRAM_ID);

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
    const { TREE_SEED, MINT_SEED } = await getCompressedNftSeeds(merchantAddress);

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

async function createImage(text: string): Promise<Buffer> {
    const image = new Jimp(800, 600, '#ffffff'); // create a new image, 800px by 600px with white background
    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK); // load font from jimp's built-in fonts

    image.print(font, 10, 10, text); // print text on image
    return image.getBufferAsync(Jimp.MIME_PNG); // get buffer of the image
}

export async function setupCollection(
    gasAddress: Keypair,
    merchantAddress: PublicKey,
    payer: PublicKey,
    name: string,
    symbol: string,
    shopName: string
): Promise<TransactionInstruction[]> {
    let { treeKey, mint, treeAuthority, metadataAccount, masterEditionAccount } = await getCompressedAccounts(
        gasAddress,
        merchantAddress
    );

    const { TREE_SEED, MINT_SEED } = await getCompressedNftSeeds(merchantAddress);
    let ata = await getAssociatedTokenAddress(
        mint, // mint
        merchantAddress // owner
    );

    const imageBuffer = await createImage(shopName);
    const file = toMetaplexFile(imageBuffer, 'image.png'); // Ensure you use correct extension .png here

    const metaplex = Metaplex.make(connection).use(keypairIdentity(gasAddress)).use(bundlrStorage());

    const uploadedMetadata = await metaplex.nfts().uploadMetadata({
        name,
        symbol,
        description: shopName + ' product collection metadat',
        image: file,
    });

    console.log('URI', uploadedMetadata.uri);
    let uri = uploadedMetadata.uri;
    const metadataV3: CreateMetadataAccountArgsV3 = {
        data: {
            name: shopName + ' NFTs',
            symbol,
            // specific json metadata for the collection
            uri,
            sellerFeeBasisPoints: 100,
            creators: [
                {
                    address: gasAddress.publicKey,
                    verified: false,
                    share: 50,
                },
                {
                    address: merchantAddress,
                    verified: false,
                    share: 50,
                },
            ],
            collection: null,
            uses: null,
        },
        isMutable: false,
        collectionDetails: null,
    };

    const createAccountIx = SystemProgram.createAccountWithSeed({
        fromPubkey: payer,
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
        payer, // payer
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
            payer: payer,
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
            payer: payer,
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

export async function setupProductMetadata(name: string, gasAddress: Keypair, image: string): Promise<string> {
    const imageResponse = await axios.get(image, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(imageResponse.data, 'binary');

    const file = toMetaplexFile(imageBuffer, 'image.png'); // Ensure you use correct extension .png here

    const metaplex = Metaplex.make(connection).use(keypairIdentity(gasAddress)).use(bundlrStorage());

    try {
        const uploadedMetadata = await metaplex.nfts().uploadMetadata({
            name: name,
            symbol: 'PRODUCT',
            description: 'A unique nft for your unique item',
            image: file,
        });
        return uploadedMetadata.uri;
    } catch (error) {
        console.log('error uri', error);
        throw error;
    }
}

export async function mintCompressedNFT(
    gasAddress: Keypair,
    merchantAddress: PublicKey,
    payer: PublicKey,
    owner: PublicKey,
    name: string,
    productUri: string
): Promise<TransactionInstruction[]> {
    let { treeKey, mint, treeAuthority, bubblegumSigner, metadataAccount, masterEditionAccount } =
        await getCompressedAccounts(gasAddress, merchantAddress);

    const mintIxs: TransactionInstruction[] = [];

    // TODO get symbol and product ru

    const compressedNFTMetadata: MetadataArgs = {
        name: name,
        symbol: 'Product',
        // specific json metadata for each NFT
        uri: productUri,
        creators: [
            {
                address: gasAddress.publicKey,
                verified: false,
                share: 50,
            },
            {
                address: merchantAddress,
                verified: false,
                share: 50,
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
                leafOwner: owner,
                leafDelegate: owner,
                // collection details
                collectionAuthority: gasAddress.publicKey,
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
