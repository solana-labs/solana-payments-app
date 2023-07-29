import { GuestIdentityDriver, Metaplex } from '@metaplex-foundation/js';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { MissingEnvError } from '../../errors/missing-env.error.js';

type TransactionData = {
    base: string;
    mintAddress?: PublicKey;
};

export const fetchManageTiersTransaction = async (
    name: string,
    threshold: number,
    discount: number,
    gasAddress: Keypair,
    merchantAddress: PublicKey,
    mintAddress?: PublicKey
): Promise<TransactionData> => {
    const heliusApiKey = process.env.HELIUS_API_KEY;

    if (heliusApiKey == null) {
        throw new MissingEnvError('helius api');
    }

    const connection = new Connection(`https://rpc.helius.xyz/?api-key=${heliusApiKey}`);
    let metaplex = Metaplex.make(connection);

    const { nftBuilder, generatedMint } = await createOrUpdateNft(
        metaplex,
        gasAddress,
        name,
        threshold,
        discount * 100,
        mintAddress,
        merchantAddress
    );

    const latestBlockhash = await connection.getLatestBlockhash();
    const transaction = await nftBuilder.toTransaction(latestBlockhash);

    transaction.partialSign(gasAddress);
    if (generatedMint) {
        transaction.partialSign(generatedMint);
    }

    let base = transaction.serialize({ requireAllSignatures: false, verifySignatures: false }).toString('base64');

    return { base, mintAddress: generatedMint?.publicKey };
};

type NftBuilderData = {
    nftBuilder: any; // replace with actual type
    generatedMint?: Keypair;
};

const createOrUpdateNft = async (
    metaplex: Metaplex,
    gasAddress: Keypair,
    name: string,
    threshold: number,
    discount: number,
    mintAddress?: PublicKey,
    merchantAddress?: PublicKey
): Promise<NftBuilderData> => {
    let nftBuilder;
    let generatedMint;

    let merchantIdentity = new GuestIdentityDriver(merchantAddress);
    let gasIdentity = new GuestIdentityDriver(gasAddress.publicKey);
    if (!mintAddress) {
        generatedMint = Keypair.generate();
        nftBuilder = await metaplex.nfts().builders().createSft(
            {
                updateAuthority: gasIdentity,
                mintAuthority: gasIdentity,
                uri: 'https://arweave.net/9bMqZG9aCu9bCbilTQYuWCyDCCOXLdd6s5YalNDTn74',
                name: name,
                sellerFeeBasisPoints: discount,
                symbol: threshold.toString(),
                useNewMint: generatedMint,
            },
            { payer: merchantIdentity }
        );
    } else {
        const nft = await metaplex.nfts().findByMint({ mintAddress });
        let updatedFields = {
            ...(nft.name !== name && { name: name }),
            ...(nft.sellerFeeBasisPoints !== discount && { sellerFeeBasisPoints: discount }),
            ...(nft.symbol !== threshold.toString() && { symbol: threshold.toString() }),
        };

        nftBuilder = await metaplex
            .nfts()
            .builders()
            .update(
                {
                    nftOrSft: nft,
                    updateAuthority: gasIdentity,
                    ...updatedFields,
                },
                {
                    payer: merchantIdentity,
                }
            );
    }

    return { nftBuilder, generatedMint };
};
