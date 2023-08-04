import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import * as RE from '@/lib/Result';
import { manageProducts, updateLoyalty, useMerchantStore } from '@/stores/merchantStore';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Transaction } from '@solana/web3.js';
import { useState } from 'react';
import { DefaultLayoutContent } from '../DefaultLayoutContent';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface Props {
    className?: string;
}

export default function CollectionSetup(props: Props) {
    const { publicKey, sendTransaction, wallet, connect, disconnect, connected, wallets, select } = useWallet();
    const { connection } = useConnection();

    const merchantInfo = useMerchantStore(state => state.merchantInfo);
    const getMerchantInfo = useMerchantStore(state => state.getMerchantInfo);

    const [name, setName] = useState('');
    const [symbol, setSymbol] = useState('');
    const [loading, setLoading] = useState(false);
    console.log('merchant Info', merchantInfo);

    async function handleSave() {
        if (!publicKey) {
            return;
        }

        let response;
        try {
            toast({
                title: 'Setting up Collection NFT and Uploading metadata',
                variant: 'constructive',
            });
            response = await manageProducts({
                name,
                symbol,
                payer: publicKey.toBase58(),
            });

            if (response.status != 200) {
                toast({
                    title: 'Error Setting up collection',
                    variant: 'destructive',
                });
            } else {
                let data = await response.json();
                if (data.transaction) {
                    const transaction = Transaction.from(Buffer.from(data.transaction, 'base64'));
                    await sendTransaction(transaction, connection);
                    await getMerchantInfo();
                }

                response = await updateLoyalty({
                    productStatus: 'ready',
                });
                toast({
                    title: 'Successfully created collection',
                    variant: 'constructive',
                });
                await getMerchantInfo();
            }
        } catch (error) {
            if (error instanceof Error) {
                toast({
                    title: 'Error Setting up collection',
                    description: error.message,
                    variant: 'destructive',
                });
            }
        }
    }

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
                <CardTitle>Setup Product NFT Collection</CardTitle>
            </CardHeader>
            <CardContent>
                <form>
                    <div className="grid w-full items-center gap-4">
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="name">Collection Name</Label>
                            <Input
                                type="string"
                                id="name"
                                onChange={e => {
                                    const value = e.target.value;
                                    setName(value);
                                }}
                                value={name}
                            />
                            <Label htmlFor="name">Collection Symbol</Label>
                            <Input
                                type="string"
                                id="symbol"
                                onChange={e => {
                                    const value = e.target.value;
                                    setSymbol(value);
                                }}
                                value={symbol}
                            />
                        </div>
                    </div>
                </form>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button pending={loading} onClick={handleSave}>
                    Setup
                </Button>
                <Button variant="outline" onClick={disconnect}>
                    Disconnect Wallet
                </Button>
            </CardFooter>
        </Card>
    );
}
