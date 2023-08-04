import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import * as RE from '@/lib/Result';
import { Tier, manageTiers, updateLoyalty, useMerchantStore } from '@/stores/merchantStore';
import { Link } from '@carbon/icons-react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Transaction } from '@solana/web3.js';
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Switch } from './ui/switch';

interface Props {
    className?: string;
}

interface EditingTier {
    name: string | undefined;
    threshold: number | undefined;
    discount: number | undefined;
}

export function TiersCard(props: Props) {
    const { publicKey, sendTransaction, wallet, connect, disconnect, connected, wallets, select } = useWallet();
    const { connection } = useConnection();

    const [editing, setEditing] = useState<number | null>(null);
    const [editingTier, setEditingTier] = useState<EditingTier>({
        name: undefined,
        threshold: undefined,
        discount: undefined,
    });
    const [loading, setLoading] = useState(false);

    const [newTier, setNewTier] = useState<EditingTier>({
        name: undefined,
        threshold: undefined,
        discount: undefined,
    });

    const merchantInfo = useMerchantStore(state => state.merchantInfo);
    const getMerchantInfo = useMerchantStore(state => state.getMerchantInfo);

    const tiers = RE.isOk(merchantInfo) && merchantInfo.data.loyalty.tiers ? merchantInfo.data.loyalty.tiers : [];

    const { toast } = useToast();
    let response;

    async function handleSave(tierId: number) {
        const tier = tiers.find(t => t.id === tierId);

        // If no changes have been made, just return
        if (
            tier &&
            editingTier &&
            tier.name === editingTier.name &&
            tier.threshold === editingTier.threshold &&
            tier.discount === editingTier.discount
        ) {
            toast({
                title: 'No Changes',
                variant: 'constructive',
            });
        } else {
            response = await manageTiers({
                id: tierId,
                ...editingTier,
                payer: publicKey?.toBase58(),
            });

            if (response.status != 200) {
                toast({
                    title: 'Error Adding a new Tier',
                    variant: 'destructive',
                });
            } else {
                let data = await response.json();
                if (data.transaction) {
                    const transaction = Transaction.from(Buffer.from(data.transaction, 'base64'));
                    await sendTransaction(transaction, connection);
                    await getMerchantInfo();
                }
                toast({
                    title: 'Successfully Saved Changes',
                    variant: 'constructive',
                });

                response = await updateLoyalty({
                    loyaltyProgram: 'tiers',
                    tiers: {
                        id: tierId,
                        ...editingTier,
                        ...(data.mintAddress && { mint: data.mintAddress }),
                    },
                });
            }
        }

        await getMerchantInfo();
        setEditing(null);
    }

    async function handleAdd() {
        if (editing != null) {
            alert('Please finish editing before adding a new tier.');
            return;
        }

        response = await manageTiers({
            ...newTier,
            payer: publicKey?.toBase58(),
        });

        if (response.status != 200) {
            toast({
                title: 'Error Adding a new Tier',
                variant: 'destructive',
            });
            return;
        } else {
            const data = await response.json();

            const transaction = Transaction.from(Buffer.from(data.transaction, 'base64'));
            await sendTransaction(transaction, connection);

            response = await updateLoyalty({
                loyaltyProgram: 'tiers',
                tiers: {
                    ...newTier,
                    ...(data.mintAddress && { mint: data.mintAddress }),
                    active: true,
                },
            });

            toast({
                title: 'Successfully Added a new Tier',
                variant: 'constructive',
            });
        }

        await getMerchantInfo();
        setNewTier({
            name: undefined,
            threshold: undefined,
            discount: undefined,
        });
    }

    async function handleToggle(tierId: number) {
        const tier = tiers.find(t => t.id === tierId);

        if (!tier) {
            return;
        }

        await updateLoyalty({
            tiers: {
                ...tier,
                active: !tier.active,
            },
            payer: publicKey?.toBase58(),
        });

        await getMerchantInfo();
        toast({
            title: `Successfully ${!tier.active ? 'activated' : 'deactivated'} Tier`,
            variant: 'constructive',
        });
    }

    async function selectLoyaltyProgram() {
        try {
            setLoading(true);
            await updateLoyalty({
                loyaltyProgram: 'tiers',
            });

            await getMerchantInfo();
            setLoading(false);

            toast({
                title: 'Successfully Selected Tiers Loyalty!',
                variant: 'constructive',
            });
        } catch (error) {
            if (error instanceof Error) {
                toast({
                    title: 'Error Starting Tiers Loyalty Program',
                    description: error.message,
                    variant: 'destructive',
                });
            }
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
    } else if (RE.isPending(merchantInfo)) {
        return (
            <div className={props.className}>
                <div className="flex flex-col justify-center h-full ">
                    <div className="mt-4 text-center">
                        <h1 className="text-2xl font-semibold">Loading</h1>
                    </div>
                </div>
            </div>
        );
    } else if (merchantInfo.data.loyalty.loyaltyProgram != 'tiers') {
        return (
            <Card className="w-max flex flex-col items-center">
                <CardHeader className="flex flex-col items-center">
                    <CardTitle>Tiered Discounts</CardTitle>
                    <CardDescription>Reward discounts to returning customers</CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-between flex-col space-y-2">
                    {!(merchantInfo.data.loyalty.tiers.length > 0) ? (
                        <Button onClick={selectLoyaltyProgram}>Start the Program</Button>
                    ) : (
                        <Button onClick={selectLoyaltyProgram} pending={loading}>
                            Restart the Program
                        </Button>
                    )}
                    <p className="text-xs">(Disables Points)</p>
                </CardFooter>
            </Card>
        );
    } else {
        return (
            <div className={props.className}>
                <Table className="w-full">
                    <TableHeader>
                        <TableRow>
                            <TableHead></TableHead>
                            <TableHead>Tier</TableHead>
                            <TableHead>$ Threshold</TableHead>
                            <TableHead>% Back</TableHead>
                            <TableHead>Active</TableHead>
                            <TableHead>Frozen</TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tiers
                            .sort((a, b) => b.threshold - a.threshold)
                            .map((tier: Tier) => (
                                <TableRow key={tier.id}>
                                    <TableCell
                                        className=""
                                        onClick={() =>
                                            tier.mint && window.open(`https://solscan.io/token/${tier.mint}`)
                                        }
                                    >
                                        <Link />
                                    </TableCell>
                                    <TableCell>
                                        {editing === tier.id ? (
                                            <Input
                                                value={editingTier.name}
                                                onChange={e => {
                                                    setEditingTier({
                                                        ...editingTier,
                                                        name: e.target.value,
                                                    });
                                                }}
                                            />
                                        ) : (
                                            tier.name
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {editing === tier.id ? (
                                            <Input
                                                value={editingTier.threshold}
                                                onChange={e => {
                                                    setEditingTier({
                                                        ...editingTier,
                                                        threshold: Number(e.target.value),
                                                    });
                                                }}
                                            />
                                        ) : (
                                            tier.threshold
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {editing === tier.id ? (
                                            <Input
                                                value={editingTier.discount}
                                                onChange={e => {
                                                    setEditingTier({
                                                        ...editingTier,
                                                        discount: Number(e.target.value),
                                                    });
                                                }}
                                            />
                                        ) : (
                                            tier.discount
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Switch checked={tier.active} onCheckedChange={() => handleToggle(tier.id)} />
                                    </TableCell>
                                    <TableCell>
                                        <Switch checked={true} />
                                    </TableCell>
                                    <TableCell className="flex flex-row space-x-1">
                                        {editing === tier.id ? (
                                            <Button variant="outline" onClick={() => handleSave(tier.id)}>
                                                Save
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    setEditing(tier.id);
                                                    setEditingTier({
                                                        name: tier.name,
                                                        threshold: tier.threshold,
                                                        discount: tier.discount,
                                                    });
                                                }}
                                            >
                                                Edit
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        <TableRow>
                            <TableCell></TableCell>
                            <TableCell>
                                <Input
                                    value={newTier.name ? newTier.name : ''}
                                    onChange={e => {
                                        setNewTier({
                                            ...newTier,
                                            name: e.target.value,
                                        });
                                    }}
                                />
                            </TableCell>
                            <TableCell>
                                <Input
                                    value={newTier.threshold ? newTier.threshold : ''}
                                    onChange={e => {
                                        setNewTier({
                                            ...newTier,
                                            threshold: Number(e.target.value),
                                        });
                                    }}
                                />
                            </TableCell>
                            <TableCell>
                                <Input
                                    value={newTier.discount ? newTier.discount : ''}
                                    onChange={e => {
                                        setNewTier({
                                            ...newTier,
                                            discount: Number(e.target.value),
                                        });
                                    }}
                                />
                            </TableCell>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                            <TableCell className="flex flex-row space-x-1">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        handleAdd();
                                    }}
                                    disabled={
                                        newTier.name === undefined ||
                                        newTier.threshold === undefined ||
                                        newTier.discount === undefined
                                    }
                                >
                                    Add
                                </Button>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        );
    }
}
