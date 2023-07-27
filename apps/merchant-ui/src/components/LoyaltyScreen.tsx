import { PointsCard } from '@/components/PointsCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useEffect, useState } from 'react';
import { DefaultLayoutContent } from './DefaultLayoutContent';
import { DefaultLayoutScreenTitle } from './DefaultLayoutScreenTitle';
import { ProductsCard } from './ProductsCard';
import { TiersCard } from './TiersCard';

interface Props {
    className?: string;
}

export function LoyaltyScreen(props: Props) {
    const { disconnect, connected } = useWallet();

    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    if (!isHydrated) {
        return null;
    }

    return (
        <DefaultLayoutContent className={props.className}>
            <DefaultLayoutScreenTitle className="hidden md:block">Loyalty Program</DefaultLayoutScreenTitle>
            <DefaultLayoutScreenTitle className="block mt-8 md:hidden">Loyalty Program</DefaultLayoutScreenTitle>
            <div className="flex justify-center mt-10">
                {!connected ? (
                    <WalletMultiButton
                        style={{
                            backgroundColor: 'black',
                            width: '400px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            zIndex: 1000,
                        }}
                    >
                        <div className="flex flex-row items-center justify-center">
                            <div className="pl-1">Connect wallet</div>
                        </div>
                    </WalletMultiButton>
                ) : (
                    <Tabs defaultValue="points" className="flex flex-col items-center w-[400px] ">
                        <div className="flex flex-row space-x-2">
                            <TabsList>
                                <TabsTrigger value="points">Points</TabsTrigger>
                                <TabsTrigger value="tiers">Tiers</TabsTrigger>
                            </TabsList>
                            <TabsList>
                                <TabsTrigger value="items">Items</TabsTrigger>
                            </TabsList>
                        </div>
                        <TabsContent value="points" className="w-full">
                            <PointsCard />
                        </TabsContent>
                        <TabsContent value="tiers" className="w-full">
                            <TiersCard />
                        </TabsContent>
                        <TabsContent value="items" className="w-full">
                            <ProductsCard />
                        </TabsContent>
                    </Tabs>
                )}
            </div>
        </DefaultLayoutContent>
    );
}
