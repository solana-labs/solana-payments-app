import { GuestIdentityDriver, Metaplex, bundlrStorage, keypairIdentity, toMetaplexFile } from '@metaplex-foundation/js';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import axios from 'axios';
import { MissingEnvError } from '../../errors/missing-env.error.js';

type TransactionData = {
    base: string;
    mintAddress?: PublicKey;
};

export const fetchManageProductsTransaction = async (
    name: string,
    gasAddress: Keypair,
    merchantAddress: PublicKey,
    image: string
): Promise<TransactionData> => {
    const heliusApiKey = process.env.HELIUS_API_KEY;

    if (heliusApiKey == null) {
        throw new MissingEnvError('helius api');
    }

    const connection = new Connection(`https://rpc.helius.xyz/?api-key=${heliusApiKey}`);
    let metaplex = Metaplex.make(connection).use(keypairIdentity(gasAddress)).use(bundlrStorage());

    let merchantIdentity = new GuestIdentityDriver(merchantAddress);
    let generatedMint = Keypair.generate();

    const imageResponse = await axios.get(image, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(imageResponse.data, 'binary');
    console.log('2');
    const file = toMetaplexFile(imageBuffer, name.replace(/\s/g, '_').toLowerCase() + '.jpg');

    console.log('got file');
    const uploadedMetadata = await metaplex.nfts().uploadMetadata({
        name: name,
        symbol: 'PRODUCT',
        description: 'A unique nft for your unique item',
        image: file,
    });

    console.log('uploaded metadata');

    let nftBuilder = await metaplex.nfts().builders().create(
        {
            uri: uploadedMetadata.uri,
            name: name,
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

    let base = transaction.serialize({ requireAllSignatures: false, verifySignatures: false }).toString('base64');

    return { base, mintAddress: generatedMint?.publicKey };
};
