import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import * as RE from '@/lib/Result';
import { API_ENDPOINTS } from '@/lib/endpoints';
import { updateLoyalty, useMerchantStore } from '@/stores/merchantStore';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Transaction } from '@solana/web3.js';
import { useEffect, useState } from 'react';

interface Props {
    className?: string;
}

export function PointsCard(props: Props) {
    const { publicKey, sendTransaction, wallet, connect, disconnect, connected, wallets, select } = useWallet();
    const { connection } = useConnection();
    const headers = {
        'Content-Type': 'application/json',
    };

    const merchantInfo = useMerchantStore(state => state.merchantInfo);
    const getMerchantInfo = useMerchantStore(state => state.getMerchantInfo);

    const [points, setPoints] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (RE.isOk(merchantInfo) && merchantInfo.data.loyalty.points.pointsBack) {
            setPoints(merchantInfo.data.loyalty.points.pointsBack);
        }
    }, [merchantInfo]);

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

            await updateLoyalty({
                loyaltyProgram: 'tiers',
                points: {
                    mint: data.pointsMint,
                    back: 1,
                },
            });

            await getMerchantInfo();

            toast({
                title: 'Successfully Created Points Back!',
                variant: 'constructive',
            });
        } catch (error) {
            if (error instanceof Error) {
                toast({
                    title: 'Error Starting Points Loyalty Program',
                    description: error.message,
                    variant: 'destructive',
                });
            }
            // throw error; // Re-throw the error
        }
    }

    async function selectLoyaltyProgram() {
        if (!publicKey) {
            return;
        }

        try {
            setLoading(true);
            await updateLoyalty({
                loyaltyProgram: 'points',
            });

            await getMerchantInfo();
            setLoading(false);
            toast({
                title: 'Successfully Started Points Back!',
                variant: 'constructive',
            });
        } catch (error) {
            if (error instanceof Error) {
                toast({
                    title: 'Error Selecting Points Loyalty Program',
                    description: error.message,
                    variant: 'destructive',
                });
            }
        }
    }

    async function updateLoyaltyPoints() {
        if (!publicKey) {
            return;
        }

        try {
            await updateLoyalty({
                points: {
                    back: points,
                },
            });

            await getMerchantInfo();
            toast({
                title: 'Successfully Updated Points!',
                variant: 'constructive',
            });
        } catch (error) {
            if (error instanceof Error) {
                toast({
                    title: 'Error Fetching Refund Status',
                    description: error.message,
                    variant: 'destructive',
                });
            }
            // throw error; // Re-throw the error
        }
    }

    if (RE.isFailed(merchantInfo)) {
        return (
            <div className={props.className}>
                <div className="flex flex-col justify-center h-full ">
                    <div className="mt-4 text-center">
                        <h1 className="text-2xl font-semibold">This Merchant does not exist</h1>
                        <p className="text-lg  mt-2">Please Log in with a different Merchant account</p>
                    </div>
                </div>
            </div>
        );
    } else if (RE.isPending(merchantInfo) || !merchantInfo.data.loyalty) {
        return (
            <div className={props.className}>
                <div className="flex flex-col justify-center h-full ">
                    <div className="mt-4 text-center">
                        <h1 className="text-2xl font-semibold">Loading</h1>
                    </div>
                </div>
            </div>
        );
    } else if (merchantInfo.data.loyalty.loyaltyProgram != 'points') {
        return (
            <Card className="w-[400px]">
                <CardHeader>
                    <CardTitle>Create Points Loyalty Program</CardTitle>
                    <CardDescription>Give back % of purchases to every customer</CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-between">
                    {!merchantInfo.data.loyalty.points.pointsMint ? (
                        <Button onClick={setupLoyaltyProgram}>Start the Program</Button>
                    ) : (
                        <Button onClick={selectLoyaltyProgram} pending={loading}>
                            Restart the Program
                        </Button>
                    )}
                    <Button variant="outline" onClick={disconnect}>
                        Disconnect Wallet
                    </Button>
                </CardFooter>
            </Card>
        );
    } else {
        return (
            <Card className="">
                <CardHeader>
                    <CardTitle>Manage Points Loyalty Program</CardTitle>
                    <CardDescription>Give back % of purchases to every customer</CardDescription>
                </CardHeader>
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
                    <Button pending={loading} onClick={updateLoyaltyPoints}>
                        Update Loyalty Points Back %
                    </Button>
                    <Button variant="outline" onClick={disconnect}>
                        Disconnect Wallet
                    </Button>
                </CardFooter>
            </Card>
        );
    }
}
