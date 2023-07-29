import { GuestIdentityDriver, Metaplex } from '@metaplex-foundation/js';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { MissingEnvError } from '../../errors/missing-env.error.js';

type TransactionData = {
    base: string;
    mintAddress?: PublicKey;
};

export const fetchManageProductsTransaction = async (
    name: string,
    gasAddress: Keypair,
    merchantAddress: PublicKey
): Promise<TransactionData> => {
    const heliusApiKey = process.env.HELIUS_API_KEY;

    if (heliusApiKey == null) {
        throw new MissingEnvError('helius api');
    }

    const connection = new Connection(`https://rpc.helius.xyz/?api-key=${heliusApiKey}`);
    let metaplex = Metaplex.make(connection);

    const { nftBuilder, generatedMint } = await createNft(metaplex, gasAddress, name, merchantAddress);

    const latestBlockhash = await connection.getLatestBlockhash();
    const transaction = await nftBuilder.toTransaction(latestBlockhash);

    transaction.partialSign(gasAddress);
    transaction.partialSign(generatedMint);

    let base = transaction.serialize({ requireAllSignatures: false, verifySignatures: false }).toString('base64');

    return { base, mintAddress: generatedMint?.publicKey };
};

type NftBuilderData = {
    nftBuilder: any; // replace with actual type
    generatedMint: Keypair;
};

const createNft = async (
    metaplex: Metaplex,
    gasAddress: Keypair,
    name: string,
    merchantAddress: PublicKey
): Promise<NftBuilderData> => {
    let merchantIdentity = new GuestIdentityDriver(merchantAddress);
    let gasIdentity = new GuestIdentityDriver(gasAddress.publicKey);
    let generatedMint = Keypair.generate();
    let nftBuilder = await metaplex.nfts().builders().create(
        {
            updateAuthority: gasIdentity,
            mintAuthority: gasIdentity,
            uri: 'https://arweave.net/9bMqZG9aCu9bCbilTQYuWCyDCCOXLdd6s5YalNDTn74',
            name: name,
            sellerFeeBasisPoints: 100,
            useNewMint: generatedMint,
        },
        { payer: merchantIdentity }
    );
    return { nftBuilder, generatedMint };
};
