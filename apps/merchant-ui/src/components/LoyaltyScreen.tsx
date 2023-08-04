import { DefaultLayoutContent } from '@/components/DefaultLayoutContent';
import { DefaultLayoutScreenTitle } from '@/components/DefaultLayoutScreenTitle';
import { PointsCard } from '@/components/PointsCard';
import ProductsCard from '@/components/ProductsCard/index';
import { TiersCard } from '@/components/TiersCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useEffect, useState } from 'react';

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

    const tabs = [
        { value: 'points', component: <PointsCard />, label: 'Points' },
        { value: 'tiers', component: <TiersCard />, label: 'Tiers' },
        { value: 'products', component: <ProductsCard />, label: 'Products' },
    ];

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
                    <Tabs defaultValue="points" className="flex flex-col items-center w-[700px] justify-center">
                        <div className="flex flex-row space-x-2">
                            {tabs.map(tab => (
                                <TabsList key={tab.value}>
                                    <TabsTrigger value={tab.value}>{tab.label}</TabsTrigger>
                                </TabsList>
                            ))}
                        </div>
                        {tabs.map(tab => (
                            <TabsContent key={tab.value} value={tab.value} className="w-full flex justify-center">
                                {tab.component}
                            </TabsContent>
                        ))}
                    </Tabs>
                )}
            </div>
        </DefaultLayoutContent>
    );
}
