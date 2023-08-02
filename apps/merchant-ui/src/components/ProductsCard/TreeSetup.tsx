import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import * as RE from '@/lib/Result';
import { useMerchantStore } from '@/stores/merchantStore';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useState } from 'react';
import { DefaultLayoutContent } from '../DefaultLayoutContent';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface Props {
    className?: string;
}

export default function TreeSetup(props: Props) {
    const { publicKey, sendTransaction, wallet, connect, disconnect, connected, wallets, select } = useWallet();
    const { connection } = useConnection();

    const merchantInfo = useMerchantStore(state => state.merchantInfo);
    const getMerchantInfo = useMerchantStore(state => state.getMerchantInfo);

    const [maxNFTs, setMaxNFTs] = useState(0);
    const [loading, setLoading] = useState(false);
    console.log('merchant Info', merchantInfo);

    if (RE.isFailed(merchantInfo)) {
        return (
            <DefaultLayoutContent className={props.className}>
                <div className="flex flex-col justify-center h-full ">
                    <div className="mt-4 text-center">
                        <h1 className="text-2xl font-semibold">This Merchant does not exist</h1>
                        <p className="text-lg  mt-2">Please Log in with a different Merchant account</p>
                    </div>
                </div>
            </DefaultLayoutContent>
        );
    }

    return (
        <Card className="">
            <CardHeader>
                <CardTitle>Setup Product NFT Size</CardTitle>
            </CardHeader>
            <CardContent>
                <form>
                    <div className="grid w-full items-center gap-4">
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="name">Max Number of product NFTs</Label>
                            <Input
                                type="number"
                                id="name"
                                placeholder="%"
                                onChange={e => {
                                    const value = parseFloat(e.target.value);
                                    setMaxNFTs(value);
                                }}
                                value={maxNFTs}
                            />
                        </div>
                    </div>
                </form>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button pending={loading}>Setup</Button>
                <Button variant="outline" onClick={disconnect}>
                    Disconnect Wallet
                </Button>
            </CardFooter>
        </Card>
    );
}
