import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { API_ENDPOINTS } from '@/lib/endpoints';
import { updateMerchant, useMerchantStore } from '@/stores/merchantStore';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Transaction } from '@solana/web3.js';
import { useState } from 'react';

export function PointsCard() {
    const { publicKey, sendTransaction, wallet, connect, disconnect, connected, wallets, select } = useWallet();
    const { connection } = useConnection();
    const headers = {
        'Content-Type': 'application/json',
    };

    const merchantInfo = useMerchantStore(state => state.merchantInfo);
    const getMerchantInfo = useMerchantStore(state => state.getMerchantInfo);

    const [points, setPoints] = useState(0);

    if (merchantInfo) {
        console.log('merchantInfo', merchantInfo.data);
    }
    async function setupLoyaltyProgram() {
        if (!publicKey) {
            return;
        }

        try {
            const response = await fetch(`${API_ENDPOINTS.pointsSetupTransaction}`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    account: publicKey.toBase58(),
                }),
                credentials: 'include',
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const buffer = Buffer.from(data.transaction, 'base64');
            const transaction = Transaction.from(buffer);
            await sendTransaction(transaction, connection);

            await updateMerchant('loyaltyProgram', 'points');
            await updateMerchant('pointsMint', data.pointsMint);
            await updateMerchant('pointsBack', data.pointsBack);

            await getMerchantInfo();
        } catch (error) {
            if (error instanceof Error) {
                toast({
                    title: 'Error Fetching Refund Status',
                    description: error.message,
                    variant: 'destructive',
                });
            }
            throw error; // Re-throw the error
        }

        toast({
            title: 'Successfully Created Points Back!',
            variant: 'constructive',
        });
    }

    async function updateLoyaltyPoints() {
        if (!publicKey) {
            return;
        }

        try {
            await updateMerchant('pointsBack', points);

            await getMerchantInfo();
        } catch (error) {
            if (error instanceof Error) {
                toast({
                    title: 'Error Fetching Refund Status',
                    description: error.message,
                    variant: 'destructive',
                });
            }
            throw error; // Re-throw the error
        }

        toast({
            title: 'Successfully Updated Points!',
            variant: 'constructive',
        });
    }

    // merchantInfo.data.loyaltyProgram
    const loyaltyProgram = 'points';
    return (
        <Card className="w-[400px]">
            <CardHeader>
                <CardTitle>Create Points Loyalty Program</CardTitle>
                <CardDescription>Give back % of purchases to every customer</CardDescription>
            </CardHeader>
            {true ? (
                <>
                    <CardFooter className="flex justify-between">
                        <Button onClick={setupLoyaltyProgram}>Start the Program</Button>
                        <Button variant="outline" onClick={disconnect}>
                            Disconnect Wallet
                        </Button>
                    </CardFooter>
                </>
            ) : (
                <>
                    <CardContent>
                        <form>
                            <div className="grid w-full items-center gap-4">
                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="name">Set % points back</Label>
                                    <Input
                                        type="number"
                                        id="name"
                                        placeholder="%"
                                        onChange={e => {
                                            const value = parseFloat(e.target.value);
                                            if (value >= 0 && value <= 100) {
                                                setPoints(value);
                                            }
                                        }}
                                        value={points}
                                    />
                                </div>
                            </div>
                        </form>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button onClick={updateLoyaltyPoints}>Update Points Back</Button>
                        <Button variant="outline" onClick={disconnect}>
                            Disconnect Wallet
                        </Button>
                    </CardFooter>
                </>
            )}
        </Card>
    );
}
