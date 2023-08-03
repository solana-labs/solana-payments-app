import { GuestIdentityDriver, Metaplex, bundlrStorage, keypairIdentity, toMetaplexFile } from '@metaplex-foundation/js';
import {
    PROGRAM_ID as BUBBLEGUM_PROGRAM_ID,
    MetadataArgs,
    TokenProgramVersion,
    TokenStandard,
    computeCreatorHash,
    computeDataHash,
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
import {
    Connection,
    Keypair,
    LAMPORTS_PER_SOL,
    PublicKey,
    SystemProgram,
    Transaction,
    TransactionInstruction,
    clusterApiUrl,
} from '@solana/web3.js';
import fs from 'fs';
import Jimp from 'jimp';
import { WrapperConnection } from './ReadApi/WrapperConnection.js';

const gasAddress = Keypair.fromSecretKey();
const merchantAddress = Keypair.fromSecretKey();

const connection = new Connection(clusterApiUrl('mainnet-beta'));
const metaplex = Metaplex.make(connection).use(keypairIdentity(gasAddress)).use(bundlrStorage());

let seed = 'treeKeypair001';

async function uploadNft() {
    const imageBuffer = fs.readFileSync('scripts/tier.png');
    const file = toMetaplexFile(imageBuffer, 'image.jpg');

    const uploadedMetadata = await metaplex.nfts().uploadMetadata({
        name: 'TIER',
        symbol: 'TIER',
        description: 'A tier for your shopify store',
        image: file,
    });
    console.log(`Uploaded metadata: ${uploadedMetadata.uri}`);
}

async function sftBuilder() {
    // process.env.GAS_KEYPAIR_SECRET

    let merchantIdentity = new GuestIdentityDriver(merchantAddress.publicKey);

    const tierManageBody = {
        name: 'asfg',
        threshold: 1,
        discount: 10,
    };

    let nftBuilder = await metaplex
        .nfts()
        .builders()
        .createSft(
            {
                updateAuthority: gasAddress,
                mintAuthority: gasAddress,
                uri: 'https://arweave.net/9bMqZG9aCu9bCbilTQYuWCyDCCOXLdd6s5YalNDTn74',
                name: tierManageBody.name,
                sellerFeeBasisPoints: tierManageBody.threshold,
                symbol: tierManageBody.discount?.toString() + 'OFF',
            },
            {
                payer: merchantIdentity,
            }
        );
    console.log('got the nft', nftBuilder);

    const latestBlockhash = await connection.getLatestBlockhash();
    const transaction = await nftBuilder.toTransaction(latestBlockhash);
    transaction.feePayer = gasAddress.publicKey;

    console.log('Fetched transaction', transaction);

    transaction.sign(gasAddress);

    const simulatedTx = await connection.simulateTransaction(transaction);
    console.log('Simulated transaction', simulatedTx);
    // console.log('the full tx', transaction);
    // let base = transaction.serialize({ requireAllSignatures: false });
    // let sig = await connection.sendRawTransaction(base, { skipPreflight: false });
    // simulate transaction to find lamport changes
    // console.log('the sig', sig);
}

async function nftBuilder() {
    let merchantIdentity = new GuestIdentityDriver(merchantAddress.publicKey);
    let generatedMint = Keypair.generate();

    let nftBuilder = await metaplex.nfts().builders().create(
        {
            uri: 'https://arweave.net/9bMqZG9aCu9bCbilTQYuWCyDCCOXLdd6s5YalNDTn74',
            name: 'name',
            symbol: 'PRODUCT',
            sellerFeeBasisPoints: 100,
            useNewMint: generatedMint,
        },
        { payer: merchantIdentity }
    );

    const latestBlockhash = await connection.getLatestBlockhash();
    const transaction = await nftBuilder.toTransaction(latestBlockhash);

    transaction.partialSign(gasAddress);
    transaction.partialSign(generatedMint);
}

async function treeSetup(): Promise<TransactionInstruction[]> {
    const payer: Keypair = gasAddress;

    const maxDepthSizePair: ValidDepthSizePair = {
        maxDepth: 3,
        maxBufferSize: 8,
    };
    const canopyDepth = maxDepthSizePair.maxDepth - 5;

    const requiredSpace = getConcurrentMerkleTreeAccountSize(
        maxDepthSizePair.maxDepth,
        maxDepthSizePair.maxBufferSize,
        canopyDepth
    );

    let treeKeypair = await PublicKey.createWithSeed(gasAddress.publicKey, seed, SPL_ACCOUNT_COMPRESSION_PROGRAM_ID);

    const [treeAuthority, _bump] = PublicKey.findProgramAddressSync([treeKeypair.toBuffer()], BUBBLEGUM_PROGRAM_ID);

    let allocTreeIx = SystemProgram.createAccountWithSeed({
        fromPubkey: payer.publicKey,
        newAccountPubkey: treeKeypair,
        basePubkey: payer.publicKey,
        seed: seed,
        lamports: await connection.getMinimumBalanceForRentExemption(requiredSpace),
        space: requiredSpace,
        programId: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
    });

    const createTreeIx = createCreateTreeInstruction(
        {
            payer: payer.publicKey,
            treeCreator: payer.publicKey,
            treeAuthority,
            merkleTree: treeKeypair,
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

function getMetadataAccount(mint: Keypair) {
    const [metadataAccount, _bump] = PublicKey.findProgramAddressSync(
        [Buffer.from('metadata', 'utf8'), TOKEN_METADATA_PROGRAM_ID.toBuffer(), mint.publicKey.toBuffer()],
        TOKEN_METADATA_PROGRAM_ID
    );
    const [masterEditionAccount, _bump2] = PublicKey.findProgramAddressSync(
        [
            Buffer.from('metadata', 'utf8'),
            TOKEN_METADATA_PROGRAM_ID.toBuffer(),
            mint.publicKey.toBuffer(),
            Buffer.from('edition', 'utf8'),
        ],
        TOKEN_METADATA_PROGRAM_ID
    );

    return { metadataAccount, masterEditionAccount };
}

async function collectionSetup(mint: Keypair): Promise<TransactionInstruction[]> {
    let feePayer = gasAddress;
    let payer = gasAddress;

    let ata = await getAssociatedTokenAddress(
        mint.publicKey, // mint
        merchantAddress.publicKey // owner
    );

    let { metadataAccount, masterEditionAccount } = getMetadataAccount(mint);

    const metadataV3: CreateMetadataAccountArgsV3 = {
        data: {
            name: 'Super Sweet NFT Collection',
            symbol: 'SSNC',
            // specific json metadata for the collection
            uri: 'https://supersweetcollection.notarealurl/collection.json',
            sellerFeeBasisPoints: 100,
            creators: [
                {
                    address: payer.publicKey,
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

    const createAccountIx = SystemProgram.createAccount({
        fromPubkey: feePayer.publicKey,
        newAccountPubkey: mint.publicKey,
        space: MINT_SIZE,
        lamports: await getMinimumBalanceForRentExemptMint(connection),
        programId: TOKEN_PROGRAM_ID,
    });

    const initMintIx = createInitializeMintInstruction(
        mint.publicKey, // mint pubkey
        0, // decimals
        gasAddress.publicKey, // mint authority
        gasAddress.publicKey // freeze authority (you can use `null` to disable it. when you disable it, you can't turn it on again)
    );

    const createATAIx = createAssociatedTokenAccountInstruction(
        feePayer.publicKey, // payer
        ata, // ata
        merchantAddress.publicKey, // owner
        mint.publicKey // mint
    );

    const mintto = createMintToCheckedInstruction(
        mint.publicKey, // mint
        ata, // receiver (sholud be a token account)
        gasAddress.publicKey, // mint authority
        1, // amount. if your decimals is 8, you mint 10^8 for 1 token.
        0 // decimals
    );

    const createMetadataIx = createCreateMetadataAccountV3Instruction(
        {
            metadata: metadataAccount,
            mint: mint.publicKey,
            mintAuthority: payer.publicKey,
            payer: payer.publicKey,
            updateAuthority: payer.publicKey,
        },
        {
            createMetadataAccountArgsV3: metadataV3,
        }
    );

    const createMasterEditionIx = createCreateMasterEditionV3Instruction(
        {
            edition: masterEditionAccount,
            mint: mint.publicKey,
            mintAuthority: payer.publicKey,
            payer: payer.publicKey,
            updateAuthority: payer.publicKey,
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
            collectionAuthority: payer.publicKey,
            collectionMint: mint.publicKey,
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

async function mintCompressedNFT(mint: Keypair): Promise<TransactionInstruction[]> {
    let payer = gasAddress;
    let treeKeypair = await PublicKey.createWithSeed(gasAddress.publicKey, seed, SPL_ACCOUNT_COMPRESSION_PROGRAM_ID);
    let receiverAddress = merchantAddress.publicKey;

    const [treeAuthority] = PublicKey.findProgramAddressSync([treeKeypair.toBuffer()], BUBBLEGUM_PROGRAM_ID);

    const [bubblegumSigner] = PublicKey.findProgramAddressSync(
        // `collection_cpi` is a custom prefix required by the Bubblegum program
        [Buffer.from('collection_cpi', 'utf8')],
        BUBBLEGUM_PROGRAM_ID
    );

    let { metadataAccount, masterEditionAccount } = getMetadataAccount(mint);

    const mintIxs: TransactionInstruction[] = [];

    const compressedNFTMetadata: MetadataArgs = {
        name: 'NFT Name',
        symbol: 'Product',
        // specific json metadata for each NFT
        uri: 'https://supersweetcollection.notarealurl/token.json',
        creators: [
            {
                address: payer.publicKey,
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
        collection: { key: mint.publicKey, verified: false },
    });

    const computedDataHash = new PublicKey(computeDataHash(metadataArgs)).toBase58();
    const computedCreatorHash = new PublicKey(computeCreatorHash(metadataArgs.creators)).toBase58();

    mintIxs.push(
        createMintToCollectionV1Instruction(
            {
                payer: payer.publicKey,

                merkleTree: treeKeypair,
                treeAuthority,
                treeDelegate: payer.publicKey,
                leafOwner: receiverAddress || payer.publicKey,
                leafDelegate: payer.publicKey,
                // collection details
                collectionAuthority: payer.publicKey,
                collectionAuthorityRecordPda: BUBBLEGUM_PROGRAM_ID,
                collectionMint: mint.publicKey,
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

async function treeLauncher() {
    let balance = await connection.getBalance(gasAddress.publicKey);
    let mint = Keypair.fromSecretKey(
        new Uint8Array([
            232, 146, 118, 118, 170, 26, 113, 31, 12, 229, 29, 120, 149, 48, 111, 93, 238, 231, 201, 152, 22, 224, 109,
            252, 226, 95, 241, 180, 26, 60, 242, 215, 122, 48, 230, 194, 87, 38, 166, 209, 231, 135, 250, 237, 73, 207,
            107, 203, 67, 111, 214, 124, 154, 168, 108, 243, 24, 42, 67, 243, 121, 193, 194, 245,
        ])
    );
    console.log('mint key', mint.publicKey.toBase58());

    // let instructions = await treeSetup();
    // let instructions = await collectionSetup(mint);
    let instructions = await mintCompressedNFT(mint);

    const blockhash = await connection.getLatestBlockhash();
    const transaction = new Transaction({
        feePayer: gasAddress.publicKey,
        blockhash: blockhash.blockhash,
        lastValidBlockHeight: blockhash.lastValidBlockHeight,
    });

    instructions.forEach(instruction => transaction.add(instruction));
    transaction.feePayer = gasAddress.publicKey;

    transaction.partialSign(gasAddress);
    // transaction.partialSign(mint);

    console.log('final transaction', transaction);
    let base = transaction.serialize({ requireAllSignatures: false, verifySignatures: false });

    let sig = await connection.sendRawTransaction(base, { skipPreflight: false });

    console.log(`https://solscan.io/tx/${sig}`);

    await new Promise(resolve => setTimeout(resolve, 2000));
    let endBalance = await connection.getBalance(gasAddress.publicKey);

    console.log('Starting account balance:', balance / LAMPORTS_PER_SOL, 'SOL\n');
    console.log('Ending account endBalance:', endBalance / LAMPORTS_PER_SOL, 'SOL\n');
}

// uploadNft();
// sftBuilder();
// editionNftBuilder();
// treeLauncher();

async function getNftsByOwner() {
    const connection = new WrapperConnection('https://rpc.helius.xyz/?api-key=792838ae-4cdd-4599-b408-f96f7b1c5c1f');
    await connection
        .getAssetsByOwner({
            ownerAddress: merchantAddress.publicKey.toBase58(),
        })
        .then(res => {
            console.log('Total assets returned:', res.total);

            // loop over each of the asset items in the collection
            res.items?.map(asset => {
                // only show compressed nft assets
                if (!asset.compression.compressed) return;

                // display a spacer between each of the assets
                console.log('\n===============================================');
                console.log('full asset', asset);

                // extra useful info
                console.log('assetId:', asset.id);

                // view the ownership info for the given asset
                console.log('ownership:', asset.ownership);

                // metadata json data (auto fetched thanks to the Metaplex Read API)
                // console.log("metadata:", asset.content.metadata);

                // view the compression specific data for the given asset
                console.log('compression:', asset.compression);

                // if (asset.compression.compressed) {
                //   console.log("==> This NFT is compressed! <===");
                //   console.log("\tleaf_id:", asset.compression.leaf_id);
                // } else console.log("==> NFT is NOT compressed! <===");
            });
        });
}

// getNftsByOwner();

async function createImage(text: string) {
    const image = new Jimp(800, 600, '#ffffff'); // create a new image, 800px by 600px with white background
    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK); // load font from jimp's built-in fonts

    image.print(font, 10, 10, text); // print text on image
    image.write('output.png'); // save the image
}

createImage('merchant shop');
