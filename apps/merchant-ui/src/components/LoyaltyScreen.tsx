import { PointsCard } from '@/components/PointsCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { DefaultLayoutContent } from './DefaultLayoutContent';
import { DefaultLayoutScreenTitle } from './DefaultLayoutScreenTitle';

interface Props {
    className?: string;
}

export function LoyaltyScreen(props: Props) {
    const { disconnect, connected } = useWallet();

    return (
        <DefaultLayoutContent className={props.className}>
            <DefaultLayoutScreenTitle className="hidden md:block">Loyalty Program</DefaultLayoutScreenTitle>
            <DefaultLayoutScreenTitle className="block mt-8 md:hidden">Loyalty Program</DefaultLayoutScreenTitle>
            <div className="flex justify-center mt-10">
                {!connected ? (
                    <WalletMultiButton
                        style={{
                            backgroundColor: 'black',
                            width: '100%',
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
                    <Tabs defaultValue="points" className="flex flex-col items-center w-[400px]">
                        <TabsList>
                            <TabsTrigger value="points">Points</TabsTrigger>
                            {/* <TabsTrigger value="tiers">Tiers</TabsTrigger> */}
                        </TabsList>
                        <TabsContent value="points">
                            <PointsCard />
                        </TabsContent>
                        <TabsContent value="tiers">Change your password here.</TabsContent>
                    </Tabs>
                )}
            </div>
        </DefaultLayoutContent>
    );
}
