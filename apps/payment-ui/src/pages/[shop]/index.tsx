import { DefaultLayout } from '@/components/DefaultLayout';
import { useRouter } from 'next/router';

export default function ShopPage() {
    const router = useRouter();
    const { shop } = router.query;

    // Mocked user data
    const userData = {
        points: 200,
        nfts: [
            { name: 'NFT 1', imageUrl: '/path/to/image1.png' },
            { name: 'NFT 2', imageUrl: '/path/to/image2.png' },
        ],
        tiers: 'Gold',
    };

    return (
        <DefaultLayout>
            <h1 className="text-4xl font-bold mb-4">{`Welcome to your rewards for ${shop}`}</h1>
            <div className="flex flex-col">
                <h2 className="text-2xl font-bold mb-2">Your rewards:</h2>
                <p className="text-lg mb-2">{`Points: ${userData.points}`}</p>
                <p className="text-lg mb-2">{`Tier: ${userData.tiers}`}</p>
                <div>
                    <h3 className="text-lg font-bold mb-2">Your NFTs:</h3>
                    {userData.nfts.map((nft, index) => (
                        <div key={index} className="mb-2">
                            {/* <img src={nft.imageUrl} alt={nft.name} className="mb-1" /> */}
                            <p className="text-lg">{nft.name}</p>
                        </div>
                    ))}
                </div>
            </div>
        </DefaultLayout>
    );
}
