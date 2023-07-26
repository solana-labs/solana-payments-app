import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import * as RE from '@/lib/Result';
import { Tier, useMerchantStore } from '@/stores/merchantStore';
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface Props {
    className?: string;
}

export function TiersCard(props: Props) {
    const [editing, setEditing] = useState<number | null>(null);
    const [originalTier, setOriginalTier] = useState<Tier | null>(null);

    const merchantInfo = useMerchantStore(state => state.merchantInfo);

    const tiers = RE.isOk(merchantInfo) && merchantInfo.data.loyalty.tiers ? merchantInfo.data.loyalty.tiers : [];

    const { toast } = useToast();

    async function handleSave(tierId: number) {
        const tier = tiers.find(t => t.id === tierId);

        // If no changes have been made, just return
        if (
            tier &&
            originalTier &&
            tier.id === originalTier.id &&
            tier.threshold === originalTier.threshold &&
            tier.discount === originalTier.discount
        ) {
            setEditing(null);
            return;
        }

        // Save changes here

        toast({
            title: 'Successfully Edited tiers',
            variant: 'constructive',
        });

        setEditing(null);
    }

    async function handleAdd() {
        if (editing != null) {
            alert('Please finish editing before adding a new tier.');
            return;
        }

        // Add a new tier here
        toast({
            title: 'Successfully Added a new Tier',
            variant: 'constructive',
        });
    }

    async function handleDelete(tierId: number) {
        if (editing != null) {
            alert('Please finish editing before deleting a tier.');
            return;
        }

        // Delete the tier here
        toast({
            title: 'Successfully Removed a Tier',
            variant: 'constructive',
        });
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
                        {tiers.map((tier: Tier) => (
                            <TableRow key={tier.id}>
                                <TableCell>{editing === tier.id ? <Input value={tier.name} /> : tier.name}</TableCell>
                                <TableCell>
                                    {editing === tier.id ? <Input value={tier.threshold} /> : tier.threshold}
                                </TableCell>
                                <TableCell>
                                    {editing === tier.id ? <Input value={tier.discount} /> : tier.discount}
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
                                                setOriginalTier({ ...tier });
                                            }}
                                        >
                                            Edit
                                        </Button>
                                    )}
                                    {tier.id === tiers[tiers.length - 1].id && (
                                        <Button variant="outline" onClick={() => handleDelete(tier.id)}>
                                            Delete
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <Button onClick={handleAdd} disabled={editing !== null} className="w-full">
                    Add Tier
                </Button>
            </div>
        );
    }
}
