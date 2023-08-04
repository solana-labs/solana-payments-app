import { GuestIdentityDriver, Metaplex } from '@metaplex-foundation/js';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { MissingEnvError } from '../../errors/missing-env.error.js';

type TransactionData = {
    base: string;
    mintAddress?: PublicKey;
};

export const fetchCreateTiersTransaction = async (
    gasAddress: Keypair,
    merchantAddress: PublicKey,
    name: string,
    discount: number,
    threshold: number
): Promise<TransactionData> => {
    const heliusApiKey = process.env.HELIUS_API_KEY;

    if (heliusApiKey == null) {
        throw new MissingEnvError('helius api');
    }

    const connection = new Connection(`https://rpc.helius.xyz/?api-key=${heliusApiKey}`);
    let metaplex = Metaplex.make(connection);

    let merchantIdentity = new GuestIdentityDriver(merchantAddress);
    let generatedMint = Keypair.generate();

    let nftBuilder = await metaplex
        .nfts()
        .builders()
        .createSft(
            {
                updateAuthority: gasAddress,
                mintAuthority: gasAddress,
                uri: 'https://arweave.net/9bMqZG9aCu9bCbilTQYuWCyDCCOXLdd6s5YalNDTn74',
                name: name,
                sellerFeeBasisPoints: threshold * 100,
                symbol: discount.toString(),
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

export const fetchUpdateTiersTransaction = async (
    gasAddress: Keypair,
    merchantAddress: PublicKey,
    mintAddress: PublicKey,
    name: string,
    discount: number,
    threshold: number
): Promise<string | null> => {
    const heliusApiKey = process.env.HELIUS_API_KEY;

    if (heliusApiKey == null) {
        throw new MissingEnvError('helius api');
    }

    const connection = new Connection(`https://rpc.helius.xyz/?api-key=${heliusApiKey}`);
    let metaplex = Metaplex.make(connection);

    let merchantIdentity = new GuestIdentityDriver(merchantAddress);

    const nft = await metaplex.nfts().findByMint({ mintAddress });
    let updatedFields = {
        ...(nft.name !== name && { name: name }),
        ...(nft.sellerFeeBasisPoints !== threshold * 100 && { sellerFeeBasisPoints: threshold * 100 }),
        ...(nft.symbol !== discount.toString() && { symbol: discount.toString() }),
    };

    if (Object.keys(updatedFields).length === 0) {
        return null;
    }

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

    transaction.partialSign(gasAddress);

    let base = transaction.serialize({ requireAllSignatures: false, verifySignatures: false }).toString('base64');

    return base;
};
