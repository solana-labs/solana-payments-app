const bs58 = require('bs58');
const {
    Metaplex,
    bundlrStorage,
    keypairIdentity,
    toMetaplexFile,
    PublicKey,
    GuestIdentityDriver,
} = require('@metaplex-foundation/js');
const { Connection, Keypair, clusterApiUrl } = require('@solana/web3.js');
const fs = require('fs');

async function uploadNft() {
    const key = Keypair
        .fromSecretKey
        // your keypair bytes
        ();

    const connection = new Connection(clusterApiUrl('mainnet-beta'));

    const metaplex = Metaplex.make(connection)
        .use(keypairIdentity(key))
        .use(
            bundlrStorage({
                address: 'https://node1.bundlr.network',
                providerUrl: clusterApiUrl('mainnet-beta'),
                timeout: 60000,
            })
        );

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

    const gasAddress = Keypair.fromSecretKey(bs58.decode(process.env.GAS_KEYPAIR_SECRET));
    const merchantAddress = new PublicKey('JAiArByfpjM3CKYms47FGNEqxuwDpJ93vDj9wGmQenJr');
    let merchantIdentity = new GuestIdentityDriver(merchantAddress);

    const tierManageBody = {
        name: 'asfg',
        threshold: 1,
        discount: 10,
    };

    const connection = new Connection(clusterApiUrl('mainnet-beta'));
    let metaplex = Metaplex.make(connection);

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

// uploadNft();
sftBuilder();
