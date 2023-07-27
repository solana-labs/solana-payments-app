import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import * as RE from '@/lib/Result';
import { Tier, updateMerchant, useMerchantStore } from '@/stores/merchantStore';
import { useWallet } from '@solana/wallet-adapter-react';
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

    const [editing, setEditing] = useState<number | null>(null);
    const [editingTier, setEditingTier] = useState<EditingTier>({
        name: undefined,
        threshold: undefined,
        discount: undefined,
    });

    const [newTier, setNewTier] = useState<EditingTier>({
        name: undefined,
        threshold: undefined,
        discount: undefined,
    });

    const merchantInfo = useMerchantStore(state => state.merchantInfo);
    const getMerchantInfo = useMerchantStore(state => state.getMerchantInfo);

    const tiers = RE.isOk(merchantInfo) && merchantInfo.data.loyalty.tiers ? merchantInfo.data.loyalty.tiers : [];

    const { toast } = useToast();

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
            await updateMerchant('tier', {
                id: tierId,
                name: editingTier.name,
                threshold: editingTier.threshold,
                discount: editingTier.discount,
            });
            await getMerchantInfo();
            toast({
                title: 'Successfully Saved Changes',
                variant: 'constructive',
            });
        }

        setEditing(null);
    }

    async function handleAdd() {
        if (editing != null) {
            alert('Please finish editing before adding a new tier.');
            return;
        }

        await updateMerchant('tier', {
            ...newTier,
        });

        await getMerchantInfo();
        setNewTier({
            name: undefined,
            threshold: undefined,
            discount: undefined,
        });
        toast({
            title: 'Successfully Added a new Tier',
            variant: 'constructive',
        });
    }

    async function handleToggle(tierId: number) {
        const tier = tiers.find(t => t.id === tierId);

        await updateMerchant('tier', {
            id: tierId,
            active: !tier?.active,
        });
        await getMerchantInfo();
        toast({
            title: 'Successfully Saved Changes',
            variant: 'constructive',
        });
    }

    async function selectLoyaltyProgram() {
        try {
            await updateMerchant('loyaltyProgram', 'tiers');

            await getMerchantInfo();

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
            <Card className="w-[400px]">
                <CardHeader>
                    <CardTitle>Select Tiers Loyalty Program</CardTitle>
                    <CardDescription>Reward discounts to returning customers</CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-between">
                    <Button onClick={selectLoyaltyProgram}>Restart the Program</Button>
                    <Button variant="outline" onClick={disconnect}>
                        Disconnect Wallet
                    </Button>
                </CardFooter>
            </Card>
        );
    } else {
        return (
            <div className={props.className}>
                <Table className="w-full">
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tier</TableHead>
                            <TableHead>$ Threshold</TableHead>
                            <TableHead>% Back</TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tiers
                            .sort((a, b) => b.threshold - a.threshold)
                            .map((tier: Tier) => (
                                <TableRow key={tier.id}>
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
                                    <TableCell>
                                        <Switch checked={tier.active} onCheckedChange={() => handleToggle(tier.id)} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        <div>New Tier</div>
                        <TableRow>
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
                <Button onClick={handleAdd} disabled={editing !== null} className="w-full">
                    Add Tier
                </Button>
            </div>
        );
    }
}
